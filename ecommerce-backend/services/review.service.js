import models from "../models/index.js";
const { Review, User, Product, Order, OrderItem } = models;
import sequelize from "../config/db.js";
import ApiError from "../utils/apiError.js";
import cloudinary from "../utils/cloudinary.js";
import { Op } from "sequelize";
import { ROLES, RATING_MIN, RATING_MAX } from "../constants/index.js";

// ============== UTILS: CLOUDINARY & RATING HELPERS ==============

const uploadToCloudinary = (file) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "fancy_store_reviews" }, (err, res) => {
            if (err) reject(err); else resolve(res.secure_url);
        });
        stream.end(file.buffer);
    });
};

const deleteFromCloudinary = async (url) => {
    try {
        const publicId = url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`fancy_store_reviews/${publicId}`);
    } catch (err) { console.error("Cloudinary Delete Fail:", err); }
};

// Internal Helper: Sirf Approved reviews ka average nikal kar Product table update karega
const syncProductStats = async (productId, transaction) => {
    const stats = await Review.findAll({
        where: { productId, isApproved: true },
        attributes: [
            [sequelize.fn("AVG", sequelize.col("rating")), "avgRating"],
            [sequelize.fn("COUNT", sequelize.col("id")), "totalReviews"],
        ],
        raw: true,
        transaction
    });

    await Product.update(
        {
            averageRating: parseFloat(stats[0].avgRating || 0).toFixed(1),
            totalReviews: parseInt(stats[0].totalReviews || 0)
        },
        { where: { id: productId }, transaction }
    );
};

// ============== CORE SERVICES ==============
// done
export const addReviewService = async (userId, productId, rating, comment, files) => {
    if (rating < RATING_MIN || rating > RATING_MAX) throw new ApiError(400, "Invalid Rating");
// console.log("User ke delivered orders:", JSON.stringify(checkOrders, null, 2));
    // Check purchase status (Single Query Join)
    const hasPurchased = await OrderItem.findOne({
        where: { productId: Number(productId) },
        include: [{ model: Order, where: { userId, status: "delivered" }, required: true }]
    });
    console.log("Purchase Record found:", hasPurchased);
    if (!hasPurchased) throw new ApiError(403, "Aap sirf delivered orders par review de sakte hain");

    const existing = await Review.findOne({ where: { userId, productId } });
    if (existing) throw new ApiError(400, "Aap is product ka review pehle hi de chuke hain");

    let imageUrls = files?.length ? await Promise.all(files.map(uploadToCloudinary)) : [];

    // Note: isApproved default 'false' hoga model definition mein
    return await Review.create({ userId, productId, rating, comment, images: imageUrls });
};

// done
export const getProductReviewsService = async (productId) => {
    const reviews = await Review.findAll({
        where: { productId, isApproved: true },
        include: [{ model: User, attributes: ["id", "name", "avatar"] }],
        order: [["createdAt", "DESC"]]
    });

    // Product table se cached rating uthayen (Super Fast)
    const productStats = await Product.findByPk(productId, {
        attributes: ["averageRating", "totalReviews"]
    });

    return { 
        avgRating: productStats?.averageRating || 0, 
        totalReviews: productStats?.totalReviews || 0, 
        reviews 
    };
};

// done
export const updateReviewService = async (reviewId, userId, rating, comment, files) => {
    const review = await Review.findOne({ where: { id: reviewId, userId } });
    if (!review) throw new ApiError(404, "Review unauthorized");

    const t = await sequelize.transaction();
    try {
        if (files?.length) {
            if (review.images?.length) await Promise.all(review.images.map(deleteFromCloudinary));
            review.images = await Promise.all(files.map(uploadToCloudinary));
        }

        if (rating) review.rating = rating;
        if (comment) review.comment = comment;

        // User edit karega to review dobara un-approved ho sakta hai (Optional Logic)
        // review.isApproved = false; 

        await review.save({ transaction: t });
        await syncProductStats(review.productId, t);
        
        await t.commit();
        return review;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

export const deleteReviewService = async (reviewId, userId, role) => {
    const where = role === ROLES.ADMIN ? { id: reviewId } : { id: reviewId, userId };
    const review = await Review.findOne({ where });
    if (!review) throw new ApiError(404, "Not found");

    const t = await sequelize.transaction();
    try {
        const pId = review.productId;
        if (review.images?.length) await Promise.all(review.images.map(deleteFromCloudinary));
        
        await review.destroy({ transaction: t });
        await syncProductStats(pId, t);
        
        await t.commit();
    } catch (err) {
        await t.rollback();
        throw err;
    }
};



// for admin 
// done
export const adminReplyService = async (reviewId, reply) => {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new ApiError(404, "Review not found");

    review.adminReply = reply;
    await review.save();
    return review;
};


// Admin 'Tick' logic: Jab admin approve kare tabhi public ko dikhe aur rating update ho
// done
export const approveReviewService = async (reviewId) => {
    const review = await Review.findByPk(reviewId);
    if (!review) throw new ApiError(404, "Review nahi mila");

    const t = await sequelize.transaction();
    try {
        review.isApproved = true;
        await review.save({ transaction: t });

        // Ab stats update honge kyunki ab ye review 'Public' ho gaya hai
        await syncProductStats(review.productId, t);
        
        await t.commit();
        return review;
    } catch (err) {
        await t.rollback();
        throw err;
    }
};

// done
export const getPendingReviewsService = async () => {
    return await Review.findAll({
        where: { isApproved: false },
        include: [
            { model: User, attributes: ['name'] },
            { model: Product, attributes: ['name'] }
        ]
    });
};


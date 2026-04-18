// // controllers/payment.controller.js
// import Stripe from "stripe";
// import dotenv from "dotenv";
// import Order from "../models/order.model.js";
// import OrderItem from "../models/orderItem.model.js";

// dotenv.config();
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // ✅ Step 1: Create Checkout Session
// export const createCheckoutSession = async (req, res) => {
//   try {
//     const {
//       amount,
//       currency = "pkr",
//       productName = "Order Payment",
//       userId,
//       shippingInfo,
//       cartItems,
//     } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ error: "Invalid amount" });
//     }

//     // ✅ Prepare line_items
//     const line_items =
//       cartItems && cartItems.length
//         ? cartItems.map((item) => ({
//             price_data: {
//               currency,
//               product_data: { 
//                 name: item.name || "Product",
//                 metadata: { productId: item.productId || "" } // ✅ add productId
//               },
//               unit_amount: Math.round((item.price ?? 0) * 100),
//             },
//             quantity: item.quantity || 1,
//           }))
//         : [
//             {
//               price_data: {
//                 currency,
//                 product_data: { name: productName },
//                 unit_amount: amount,
//               },
//               quantity: 1,
//             },
//           ];

//     // ✅ Create Stripe session
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items,
//       mode: "payment",
//       client_reference_id: userId ? String(userId) : undefined,
//       metadata: {
//         userId: userId ? String(userId) : "",
//         shipping: shippingInfo ? JSON.stringify(shippingInfo) : "",
//       },
//       success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
//     });

//     return res.json({ url: session.url });
//   } catch (err) {
//     console.error("❌ createCheckoutSession error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };

// // ✅ Step 2: Stripe Webhook
// export const stripeWebhook = async (req, res) => {
//   const sig = req.headers["stripe-signature"];
//   let event;

//   try {
//     // ⚠️ req.body should be raw
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("❌ Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object;

//     try {
//       const stripeSessionId = session.id;
//       const existing = await Order.findOne({ where: { stripeSessionId } });

//       if (!existing) {
//         const userId =
//           session.client_reference_id || session.metadata?.userId || null;

//         let shipping = {};
//         try {
//           shipping = session.metadata?.shipping
//             ? JSON.parse(session.metadata.shipping)
//             : {};
//         } catch (e) {}

//         // ✅ Create Order
//         const createdOrder = await Order.create({
//           userId,
//           fullName: shipping.fullName || "",
//           email: shipping.email || session.customer_email || "",
//           phoneNumber: shipping.phoneNumber || "",
//           address: shipping.address || "",
//           city: shipping.city || "",
//           postalCode: shipping.postalCode || "",
//           country: shipping.country || "",
//           paymentMethod: "Card",
//           paymentStatus: "Paid",
//           totalAmount: (session.amount_total || 0) / 100,
//           stripeSessionId,
//         });

//         // ✅ Fetch line_items from Stripe
//         const sessionFull = await stripe.checkout.sessions.retrieve(
//           stripeSessionId,
//           { expand: ["line_items"] }
//         );
//         const items = sessionFull.line_items?.data || [];

//         for (const li of items) {
//           // ✅ Extract productId from metadata
//           const productId = li.price?.metadata?.productId || null;

//           await OrderItem.create({
//             orderId: createdOrder.id,
//             productId, // ✅ important for Sequelize notNull
//             productName: li.description || li.price?.product || "Product",
//             quantity: li.quantity,
//             price: (li.amount_subtotal || li.price?.unit_amount || 0) / 100,
//           });
//         }

//         console.log("✅ Order created from webhook:", createdOrder.id);
//       }
//     } catch (err) {
//       console.error("❌ Error creating order in webhook:", err);
//     }
//   }

//   res.json({ received: true });
// };

// // ✅ Step 3: Verify Session
// export const verifySession = async (req, res) => {
//   try {
//     const { session_id } = req.query;

//     if (!session_id) {
//       return res.status(400).json({ error: "session_id is required" });
//     }

//     const session = await stripe.checkout.sessions.retrieve(session_id);

//     return res.json({
//       success: session.payment_status === "paid",
//       status: session.payment_status,
//       session,
//     });
//   } catch (err) {
//     console.error("❌ verifySession error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };



import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const { amount, currency = "pkr", productName = "Order Payment", userId, shippingInfo, cartItems } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const line_items = cartItems && cartItems.length
      ? cartItems.map(item => ({
          price_data: {
            currency,
            product_data: { name: item.name || "Product", metadata: { productId: item.productId || "" } },
            unit_amount: Math.round((item.price ?? 0) * 100),
          },
          quantity: item.quantity || 1,
        }))
      : [{ price_data: { currency, product_data: { name: productName }, unit_amount: amount }, quantity: 1 }];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      client_reference_id: userId ? String(userId) : undefined,
      metadata: { userId: userId ? String(userId) : "", shipping: shippingInfo ? JSON.stringify(shippingInfo) : "" },
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/failed`,
    });

    return res.json({ url: session.url });
  } catch (err) {
    console.error("❌ createCheckoutSession error:", err);
    return res.status(500).json({ error: err.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const stripeSessionId = session.id;
      const existing = await Order.findOne({ where: { stripeSessionId } });

      if (!existing) {
        const userId = session.client_reference_id || session.metadata?.userId || null;
        let shipping = {};
        try { shipping = session.metadata?.shipping ? JSON.parse(session.metadata.shipping) : {}; } catch (e) {}

        const createdOrder = await Order.create({
          userId,
          fullName: shipping.fullName || "",
          email: shipping.email || session.customer_email || "",
          phoneNumber: shipping.phoneNumber || "",
          address: shipping.address || "",
          city: shipping.city || "",
          postalCode: shipping.postalCode || "",
          country: shipping.country || "",
          paymentMethod: "Card",
          paymentStatus: "Paid",
          totalAmount: (session.amount_total || 0) / 100,
          stripeSessionId,
        });

        const sessionFull = await stripe.checkout.sessions.retrieve(stripeSessionId, { expand: ["line_items"] });
        const items = sessionFull.line_items?.data || [];

        for (const li of items) {
          const productId = li.price?.metadata?.productId;
          if (!productId) {
            console.warn("Skipping OrderItem: missing productId", li);
            continue;
          }

          await OrderItem.create({
            orderId: createdOrder.id,
            productId,
            productName: li.description || li.price?.product || "Product",
            quantity: li.quantity,
            price: (li.amount_subtotal || li.price?.unit_amount || 0) / 100,
          });
        }

        console.log("✅ Order created from webhook:", createdOrder.id);
      }
    } catch (err) {
      console.error("❌ Error creating order in webhook:", err);
    }
  }

  res.json({ received: true });
};

export const verifySession = async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "session_id is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    return res.json({ success: session.payment_status === "paid", status: session.payment_status, session });
  } catch (err) {
    console.error("❌ verifySession error:", err);
    return res.status(500).json({ error: err.message });
  }
};

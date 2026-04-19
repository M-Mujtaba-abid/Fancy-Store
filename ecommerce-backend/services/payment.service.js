import Stripe from "stripe";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import OrderItem from "../models/orderItem.model.js";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ================= CREATE CHECKOUT SESSION =================
export const createCheckoutSessionService = async ({ amount, currency = "pkr", productName = "Order Payment", userId, shippingInfo, cartItems }) => {
  const line_items = cartItems && cartItems.length
    ? cartItems.map(item => ({
        price_data: {
          currency,
          product_data: {
            name: item.name || "Product",
            metadata: { productId: item.productId || "" },
          },
          unit_amount: Math.round((item.price ?? 0) * 100),
        },
        quantity: item.quantity || 1,
      }))
    : [{
        price_data: {
          currency,
          product_data: { name: productName },
          unit_amount: amount,
        },
        quantity: 1,
      }];

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items,
    mode: "payment",
    client_reference_id: userId ? String(userId) : undefined,
    metadata: {
      userId: userId ? String(userId) : "",
      shipping: shippingInfo ? JSON.stringify(shippingInfo) : "",
    },
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/failed`,
  });

  return session.url;
};

// ================= HANDLE WEBHOOK EVENT =================
export const handleWebhookService = (payload, sig) => {
  // signature verify — agar fail ho to exception throw hogi
  return stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
};

export const processCheckoutCompletedService = async (session) => {
  const stripeSessionId = session.id;

  const existing = await Order.findOne({ where: { stripeSessionId } });
  if (existing) return; // duplicate webhook, ignore

  const userId = session.client_reference_id || session.metadata?.userId || null;

  let shipping = {};
  try {
    shipping = session.metadata?.shipping ? JSON.parse(session.metadata.shipping) : {};
  } catch (e) {}

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

  const sessionFull = await stripe.checkout.sessions.retrieve(stripeSessionId, {
    expand: ["line_items"],
  });

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

  console.log(" Order created from webhook:", createdOrder.id);
};

// ================= VERIFY SESSION =================
export const verifySessionService = async (session_id) => {
  const session = await stripe.checkout.sessions.retrieve(session_id);
  return {
    success: session.payment_status === "paid",
    status: session.payment_status,
    session,
  };
};
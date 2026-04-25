// ================= USER ORDER CONFIRMATION =================
export const orderConfirmationTemplate = (userName, order) => {
  return `
    <h2>Hi ${userName}! 🎉</h2>
    <p>Your order has been placed successfully!</p>
    <hr/>
    <p><strong>Order ID:</strong> #${order.id}</p>
    <p><strong>Total Amount:</strong> Rs. ${order.totalAmount}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <hr/>
    <p>We will deliver your order soon!</p>
    <p>Thank you for shopping at <strong>Fancy Store</strong> 🛍️</p>
  `;
};

// ================= ADMIN NEW ORDER ALERT =================
export const adminNewOrderTemplate = (userName, userEmail, order) => {
  return `
    <h2>📦 New Order Received!</h2>
    <hr/>
    <p><strong>Order ID:</strong> #${order.id}</p>
    <p><strong>Customer:</strong> ${userName}</p>
    <p><strong>Email:</strong> ${userEmail}</p>
    <p><strong>Total Amount:</strong> Rs. ${order.totalAmount}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    <hr/>
    <p>Login to admin panel to manage this order.</p>
  `;
};
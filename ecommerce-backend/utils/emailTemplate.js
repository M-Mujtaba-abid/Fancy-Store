// ================= USER ORDER CONFIRMATION =================
export const orderConfirmationTemplate = (userName, order) => {
  const date = new Date().toLocaleDateString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmed – FancyStore</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">

        <!-- Header -->
        <tr>
          <td style="background:#1a1a2e;padding:24px 32px;text-align:center;">
            <span style="font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">
              Fancy<span style="color:#e94560;">Store</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">

            <!-- Success icon -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center" style="padding-bottom:16px;">
                <div style="width:56px;height:56px;background:#e8f5e9;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="color:#43a047;font-size:24px;">✓</span>
                </div>
              </td></tr>
              <tr><td align="center">
                <h1 style="margin:0 0 6px;font-size:20px;color:#1a1a2e;">Order placed successfully!</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#666;">
                  Hi <strong>${userName}</strong>, your order is confirmed. We're getting it ready for you!
                </p>
              </td></tr>
            </table>

            <!-- Order Progress -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                ${["Confirmed","Processing","Shipped","Delivered"].map((step, i) => `
                <td align="center" style="position:relative;">
                  <div style="width:28px;height:28px;border-radius:50%;background:${i===0?"#43a047":"#f0f0f0"};display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:${i===0?"#fff":"#aaa"};margin-bottom:6px;">
                    ${i===0?"✓":i+1}
                  </div>
                  <div style="font-size:10px;color:${i===0?"#43a047":"#aaa"};font-weight:${i===0?"600":"400"};">${step}</div>
                </td>
                `).join("")}
              </tr>
            </table>

            <!-- Order Summary Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e0e4f0;border-radius:6px;padding:16px;margin-bottom:20px;">
              <tr><td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.8px;">Order Summary</p>
                ${[
                  ["Order ID", `#${order.id}`],
                  ["Date", date],
                  ["Total Amount", `Rs. ${order.totalAmount.toLocaleString()}`],
                  ["Payment Method", order.paymentMethod || "Cash on Delivery"],
                  ["Status", `<span style="background:#e8f5e9;color:#2e7d32;font-size:12px;padding:2px 10px;border-radius:20px;">● ${order.status}</span>`],
                ].map(([label, value]) => `
                  <table width="100%" style="border-bottom:1px solid #eee;">
                    <tr>
                      <td style="padding:8px 0;font-size:14px;color:#666;">${label}</td>
                      <td style="padding:8px 0;font-size:14px;color:#1a1a2e;font-weight:500;text-align:right;">${value}</td>
                    </tr>
                  </table>
                `).join("")}
              </td></tr>
            </table>

            <p style="font-size:13px;color:#555;text-align:center;line-height:1.7;margin-bottom:20px;">
              Your order will arrive within <strong>3–5 business days</strong>.<br/>
              A tracking link will be sent once your order is shipped.
            </p>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.FRONTEND_URL}/orders/${order.id}"
                  style="display:inline-block;background:#e94560;color:#fff;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">
                  Track Your Order
                </a>
              </td></tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f4f4;padding:20px 32px;text-align:center;">
            <p style="font-size:12px;color:#999;line-height:1.8;margin:0;">
              Questions? <a href="mailto:support@fancystore.pk" style="color:#1a1a2e;">Contact Support</a><br/>
              &copy; ${new Date().getFullYear()} FancyStore &nbsp;|&nbsp;
              <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color:#999;">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};


// ================= ADMIN NEW ORDER ALERT =================
export const adminNewOrderTemplate = (userName, userEmail, order) => {
  const date = new Date().toLocaleString("en-PK", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const initials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>New Order Alert – FancyStore Admin</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">

        <!-- Header -->
        <tr>
          <td style="background:#0f3460;padding:20px 32px;">
            <table width="100%"><tr>
              <td>
                <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:1px;">
                  Fancy<span style="color:#e94560;">Store</span>
                  <span style="font-size:12px;font-weight:400;opacity:0.7;"> Admin</span>
                </span>
              </td>
              <td align="right">
                <span style="background:#e94560;color:#fff;font-size:11px;font-weight:600;padding:3px 12px;border-radius:20px;letter-spacing:0.5px;">
                  NEW ORDER
                </span>
              </td>
            </tr></table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;">

            <!-- Alert Banner -->
            <table width="100%" style="background:#fff8e1;border-left:3px solid #f59e0b;border-radius:0 6px 6px 0;margin-bottom:20px;">
              <tr><td style="padding:12px 16px;font-size:13px;color:#92400e;">
                ⚠️ &nbsp;A new order has been placed and requires your attention.
              </td></tr>
            </table>

            <!-- Customer Info -->
            <table width="100%" style="border-bottom:1px solid #eee;padding-bottom:16px;margin-bottom:16px;" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:12px 0;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="vertical-align:top;padding-right:12px;">
                        <div style="width:40px;height:40px;border-radius:50%;background:#e8eaf6;display:inline-flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;color:#3949ab;">
                          ${initials}
                        </div>
                      </td>
                      <td>
                        <strong style="font-size:14px;color:#1a1a2e;">${userName}</strong><br/>
                        <span style="font-size:12px;color:#888;">${userEmail}</span>
                      </td>
                      <td align="right" style="padding-left:16px;">
                        <div style="font-size:11px;color:#888;margin-bottom:2px;">Total</div>
                        <div style="font-size:24px;font-weight:700;color:#1a1a2e;">Rs. ${order.totalAmount.toLocaleString()}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Stats Grid -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                ${[
                  ["Order ID", `#${order.id}`],
                  ["Payment", order.paymentMethod || "COD"],
                  ["Status", order.status],
                ].map(([label, value]) => `
                  <td width="33%" style="padding:4px;">
                    <table width="100%" style="background:#f8f9ff;border:1px solid #e0e4f0;border-radius:6px;text-align:center;">
                      <tr><td style="padding:12px 8px;">
                        <div style="font-size:14px;font-weight:600;color:#1a1a2e;">${value}</div>
                        <div style="font-size:11px;color:#888;margin-top:2px;">${label}</div>
                      </td></tr>
                    </table>
                  </td>
                `).join("")}
              </tr>
            </table>

            <!-- Order Details -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border:1px solid #e0e4f0;border-radius:6px;padding:16px;margin-bottom:20px;">
              <tr><td>
                <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:0.8px;">Order Details</p>
                ${[
                  ["Order Placed", date],
                  ["Total Items", order.items?.length ?? "—"],
                  ["Delivery Address", order.address || "—"],
                ].map(([label, value]) => `
                  <table width="100%" style="border-bottom:1px solid #eee;">
                    <tr>
                      <td style="padding:8px 0;font-size:13px;color:#666;">${label}</td>
                      <td style="padding:8px 0;font-size:13px;color:#1a1a2e;font-weight:500;text-align:right;">${value}</td>
                    </tr>
                  </table>
                `).join("")}
              </td></tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr><td align="center">
                <a href="${process.env.ADMIN_PANEL_URL}/orders/${order.id}"
                  style="display:inline-block;background:#0f3460;color:#fff;padding:12px 32px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none;">
                  Manage This Order
                </a>
              </td></tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f4f4;padding:16px 32px;text-align:center;">
            <p style="font-size:12px;color:#999;margin:0;">
              Automated alert from FancyStore Admin System &nbsp;|&nbsp;
              <a href="${process.env.ADMIN_PANEL_URL}" style="color:#999;">Admin Panel</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
};
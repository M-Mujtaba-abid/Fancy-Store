import Contact from "../models/contact.model.js";
import sendEmail from "../utils/sendEmail.js";

export const createContactService = async ({
  name,
  email,
  subject,
  message,
  category = "general",
}) => {
  // 1. Database mein save karein
  const newContact = await Contact.create({ name, email, subject, message, category });

  // 2. Admin Notification Template (Aapka original design)
  const adminMsg = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
          .header { background-color: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; display: inline-block; width: 100px; }
          .message-box { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>📩 New Contact Message</h1></div>
          <div class="content">
            <div class="detail-row"><span class="detail-label">Name:</span> <span>${name}</span></div>
            <div class="detail-row"><span class="detail-label">Email:</span> <span>${email}</span></div>
            <div class="detail-row"><span class="detail-label">Category:</span> <span>${category}</span></div>
            <div class="detail-row"><span class="detail-label">Subject:</span> <span>${subject || "No subject"}</span></div>
            <div class="message-box">${message.replace(/\n/g, "<br>")}</div>
            <p><a href="mailto:${email}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Reply to Customer</a></p>
          </div>
        </div>
      </body>
    </html>
  `;

  // 3. Customer Confirmation Template (Naya added)
  const customerConfirmationMsg = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #10b981;">Hi ${name}, 👋</h2>
          <p>Thank you for contacting <strong>Fancy Store</strong>! We've received your message regarding <b>${subject || "your inquiry"}</b>.</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <p style="margin: 0;"><strong>Your Message:</strong></p>
            <p style="font-style: italic; color: #4b5563;">"${message}"</p>
          </div>
          <p>Our team will review your request and get back to you as soon as possible (usually within 24 hours).</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 Fancy Store 🛍️ | This is an automated confirmation.</p>
        </div>
      </body>
    </html>
  `;

  try {
    // Admin ko notify karein
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(process.env.ADMIN_EMAIL, "📩 New Submission: " + (subject || "General"), adminMsg);
      console.log("✅ Admin notified!");
    }

    // Customer ko confirmation bhejein
    await sendEmail(email, "We've received your message! - Fancy Store", customerConfirmationMsg);
    console.log("✅ Customer confirmation sent!");

  } catch (error) {
    console.error("❌ Email process failed:", error.message);
  }

  return newContact;
};

export const getAllContactsService = async () => {
  return await Contact.findAll({
    order: [["created_at", "DESC"]],
  });
};

export const replyToContactService = async (id, replyMessage) => {
  const contact = await Contact.findByPk(id);
  if (!contact) throw { status: 404, message: "Contact not found" };

  const replyHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Hi ${contact.name},</h2>
      <p>Regarding your message about <b>${contact.subject}</b>:</p>
      <div style="background-color: #ecfdf5; padding: 20px; border-left: 4px solid #10b981;">
        ${replyMessage.replace(/\n/g, "<br>")}
      </div>
      <p>Regards,<br>Fancy Store Team</p>
    </div>
  `;

  // 1. Pehle email bhejein
  await sendEmail(contact.email, `Reply: ${contact.subject || "No subject"}`, replyHtml);

  // 2. ✅ Status update karein (YEH PEHLE HONA CHAHIYE)
  contact.is_replied = true; 
  await contact.save();      

  // 3. Sabse aakhir mein return karein
  return contact.email; 
};
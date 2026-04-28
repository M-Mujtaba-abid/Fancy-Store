import Contact from "../models/contact.model.js";
import sendEmail from "../utils/sendEmail.js";

export const createContactService = async ({
  name,
  email,
  subject,
  message,
}) => {
  const newContact = await Contact.create({ name, email, subject, message });

  // ✅ Proper HTML format for admin email
  const adminMsg = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
          .header { background-color: #3b82f6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; display: inline-block; width: 100px; }
          .message-box { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📩 New Contact Message</h1>
          </div>
          <div class="content">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span>${name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Subject:</span>
              <span><strong>${subject || "No subject"}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Message:</span>
            </div>
            <div class="message-box">
              ${message.replace(/\n/g, "<br>")}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p>
              <a href="mailto:${email}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">Reply to Customer</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated message from Fancy Store Contact Form</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    console.log(
      `📧 Queuing contact form email to admin: ${process.env.ADMIN_EMAIL}`,
    );
    if (process.env.ADMIN_EMAIL) {
      await sendEmail(
        process.env.ADMIN_EMAIL,
        "📩 New Contact Form Submission from " + name,
        adminMsg,
      );
      console.log("✅ Contact form admin notification sent!");
    } else {
      console.warn(
        "⚠️  ADMIN_EMAIL not configured - contact won't be notified",
      );
    }
  } catch (error) {
    console.error(
      "❌ Failed to send contact notification email:",
      error.message,
    );
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

  // ✅ Proper HTML format for reply email
  const replyHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
          .header { background-color: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
          .message-box { background-color: #ecfdf5; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ We've Got Your Message!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${contact.name}</strong>,</p>
            <p>Thank you for contacting us about: <strong>"${contact.subject || "Your query"}"</strong></p>
            
            <div class="message-box">
              ${replyMessage.replace(/\n/g, "<br>")}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="color: #6b7280; font-size: 14px;">
              If you have any further questions, feel free to reply to this email.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 Fancy Store 🛍️ | Thank you for choosing us!</p>
          </div>
        </div>
      </body>
    </html>
  `;

  await sendEmail(
    contact.email,
    `Reply: ${contact.subject || "No subject"}`,
    replyHtml,
  );

  return contact.email;
};

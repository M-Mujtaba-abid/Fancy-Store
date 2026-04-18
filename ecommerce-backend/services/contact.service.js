import Contact from "../models/contact.model.js";
import sendEmail from "../utils/sendEmail.js";

export const createContactService = async ({ name, email, subject, message }) => {
  const newContact = await Contact.create({ name, email, subject, message });

  const adminMsg = `
    📩 New Contact Message Received
    -------------------------------
    Name: ${name}
    Email: ${email}
    Subject: ${subject || "No subject"}
    Message: ${message}
  `;

  await sendEmail(process.env.ADMIN_EMAIL, "New Contact Form Submission", adminMsg);

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

  await sendEmail(
    contact.email,
    `Reply to your query: ${contact.subject || "No subject"}`,
    `Dear ${contact.name},\n\n${replyMessage}\n\nBest Regards,\nAdmin`
  );

  return contact.email;
};
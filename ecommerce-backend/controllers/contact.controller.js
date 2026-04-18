// import Contact from "../models/contact.model.js";
// import sendEmail from "../utils/sendEmail.js"; // 👈 utility import

// // ✅ Add new contact message
// export const createContact = async (req, res) => {
//   try {
//     const { name, email, subject, message } = req.body;

//     if (!name || !email || !message) {
//       return res.status(400).json({ error: "Name, email, and message are required" });
//     }

//     // DB save
//     const newContact = await Contact.create({ name, email, subject, message });

//     // 👇 Email notify to admin
//     const adminMsg = `
//       📩 New Contact Message Received
//       -------------------------------
//       Name: ${name}
//       Email: ${email}
//       Subject: ${subject || "No subject"}
//       Message: ${message}
//     `;

//     await sendEmail(process.env.ADMIN_EMAIL, "New Contact Form Submission", adminMsg);

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully! Admin has been notified.",
//       data: newContact,
//     });
//   } catch (error) {
//     console.error("Error creating contact:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ✅ Get all messages (for admin panel)
// export const getAllContacts = async (req, res) => {
//   try {
//     const contacts = await Contact.findAll({
//       order: [["created_at", "DESC"]],
//     });
//     res.status(200).json({ success: true, data: contacts });
//   } catch (error) {
//     console.error("Error fetching contacts:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };



// // ✅ Admin reply to user
// export const replyToContact = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { replyMessage } = req.body;

//     if (!replyMessage) {
//       return res.status(400).json({ error: "Reply message is required" });
//     }

//     // user ko find karo jisko reply bhejna hai
//     const contact = await Contact.findByPk(id);
//     if (!contact) {
//       return res.status(404).json({ error: "Contact not found" });
//     }

//     // send email to user
//     await sendEmail(
//       contact.email, // 👈 user ka email
//       `Reply to your query: ${contact.subject || "No subject"}`,
//       `Dear ${contact.name},\n\n${replyMessage}\n\nBest Regards,\nAdmin`
//     );

//     res.status(200).json({
//       success: true,
//       message: `Reply sent to ${contact.email}`,
//     });
//   } catch (error) {
//     console.error("Error replying to contact:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// };
// n
import {
  createContactService,
  getAllContactsService,
  replyToContactService,
} from "../services/contact.service.js";

export const createContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const data = await createContactService({ name, email, subject, message });

    return res.status(201).json({
      success: true,
      message: "Message sent successfully! Admin has been notified.",
      data,
    });
  } catch (err) {
    console.error("Error creating contact:", err);
    return res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const data = await getAllContactsService();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("Error fetching contacts:", err);
    return res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
};

export const replyToContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ error: "Reply message is required" });
    }

    const userEmail = await replyToContactService(id, replyMessage);

    return res.status(200).json({
      success: true,
      message: `Reply sent to ${userEmail}`,
    });
  } catch (err) {
    console.error("Error replying to contact:", err);
    return res.status(err.status || 500).json({ error: err.message || "Server error" });
  }
};
// routes/contact.route.js
import express from "express";
import { createContact, getAllContacts,replyToContact } from "../controllers/contact.controller.js";

const router = express.Router();

// POST → Customer will send message
router.post("/", createContact);

// GET → Admin will view all messages
router.get("/", getAllContacts);
router.post("/reply/:id", replyToContact);

export default router;

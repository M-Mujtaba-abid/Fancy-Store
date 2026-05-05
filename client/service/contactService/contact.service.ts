import api from "../api";
import { ContactFormData, ContactMessage } from "@/types/contact.types";

// Re-export types for backward compatibility
export type { ContactFormData, ContactMessage };

// Customer → Submit contact form
export const submitContactForm = async (formData: ContactFormData) => {
  try {
    const response = await api.post("/contacts", formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit contact form");
  }
};

// Admin → Get all contact messages
export const getAllContacts = async (): Promise<ContactMessage[]> => {
  try {
    const response = await api.get("/contacts");
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch contacts");
  }
};

// Admin → Reply to a specific contact message
export const replyToContact = async (id: number, replyMessage: string) => {
  try {
    const response = await api.post(`/contacts/reply/${id}`, { replyMessage });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to reply to contact");
  }
};
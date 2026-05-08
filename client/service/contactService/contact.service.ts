import api from "../api";
import { ContactFormData, ContactMessage } from "@/types/contact.types";

// Re-export types for backward compatibility
export type { ContactFormData, ContactMessage };

export const contactService = {
  submitForm: async (formData: ContactFormData) => {
    const res = await api.post("/contacts", formData);
    return res.data;
  },

  getAllContacts: async (): Promise<ContactMessage[]> => {
    const res = await api.get("/contacts");
    return res.data.data || res.data;
  },

  replyToContact: async ({ id, replyMessage }: { id: number; replyMessage: string }) => {
    const res = await api.post(`/contacts/reply/${id}`, { replyMessage });
    return res.data;
  },
};
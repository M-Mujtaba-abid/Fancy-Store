import api from "../api";

export interface ContactFormData {
  name: string;
  email: string;
  category: "order_issue" | "payment" | "return_refund" | "general" | "other";
  subject: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  is_replied: boolean;
  created_at: string;
}

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
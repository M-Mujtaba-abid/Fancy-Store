export type ContactCategory = "order_issue" | "payment" | "return_refund" | "general" | "other";

export interface ContactFormData {
  name: string;
  email: string;
  category: ContactCategory;
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

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: any;
}

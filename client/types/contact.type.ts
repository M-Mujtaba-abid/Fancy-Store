export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  category?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: any;
}
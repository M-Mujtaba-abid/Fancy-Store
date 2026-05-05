import { ContactFormData } from "@/types/contact.types";

export const INITIAL_FORM_STATE: ContactFormData = {
  name: "",
  email: "",
  category: "general",
  subject: "",
  message: "",
};
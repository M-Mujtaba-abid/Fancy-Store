import { useState } from "react";
import { ContactFormData } from "@/types/contact.types";
import { submitContactForm } from "@/service/contactService/contact.service";
import toast from "react-hot-toast";

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      category: "general",
      subject: "",
      message: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Save data before reset
    const dataToSend = { ...formData };

    // Reset form immediately
    resetForm();

    // Show loading toast
    const toastId = toast.loading("Sending your message... ⏳", {
      position: "top-right",
    });

    // Call API in background
    try {
      await submitContactForm(dataToSend);
      toast.success("Message sent! We'll get back to you soon 🎉", {
        id: toastId,
        duration: 4000,
      });
    } catch (err: any) {
      toast.error("Something went wrong, please try again!", {
        id: toastId,
        duration: 4000,
      });
    }
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    resetForm,
  };
};

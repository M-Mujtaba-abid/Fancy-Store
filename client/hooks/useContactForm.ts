"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSubmitContactForm } from "./useContact";
import { INITIAL_FORM_STATE } from "@/constants/contact.constants";

export const useContactForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const { mutate: submitForm } = useSubmitContactForm();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSend = { ...formData };

    // Reset immediately — Fire and Forget
    setFormData(INITIAL_FORM_STATE);

    const toastId = toast.loading("Sending your message... ⏳");

    submitForm(dataToSend, {
      onSuccess: () => {
        toast.success("Message sent! We'll get back to you soon 🎉", {
          id: toastId,
          duration: 4000,
        });
      },
      onError: () => {
        toast.error("Something went wrong, please try again ❌", {
          id: toastId,
          duration: 4000,
        });
      },
    });
  };

  return { formData, handleChange, handleSubmit };
};

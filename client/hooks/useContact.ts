import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { contactService } from "@/service/contactService/contact.service";
import { ContactFormData } from "@/types/contact.types";
import toast from "react-hot-toast";

// ================= USER HOOKS =================

// 1. Submit contact form (Fire and Forget)
export const useSubmitContactForm = () => {
  return useMutation({
    mutationFn: (data: ContactFormData) => contactService.submitForm(data),
  });
};

// ================= ADMIN HOOKS =================

// 2. Get all contact messages
export const useGetAllContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: contactService.getAllContacts,
  });
};

// 3. Reply to a specific contact message
export const useReplyToContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: contactService.replyToContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Reply sent successfully! ✅");
    },
    onError: () => {
      toast.error("Failed to send reply ❌");
    },
  });
};
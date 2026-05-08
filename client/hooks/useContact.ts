"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { contactService } from "@/service/contactService/contact.service";
import { ContactFormData, ContactMessage } from "@/types/contact.types";
import { INITIAL_FORM_STATE } from "@/constants/contact.constants";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

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

// 4. Admin contacts state management
export const useAdminContacts = () => {
  const { data: contacts = [], isLoading, isError, error } = useGetAllContacts();
  const axiosError = error as AxiosError<{ message: string }>;
  const { mutate: replyToContact, isPending } = useReplyToContact();

  const [filteredContacts, setFilteredContacts] = useState<ContactMessage[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "replied">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyError, setReplyError] = useState("");

  // Apply filters
  useEffect(() => {
    let filtered = contacts;

    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (contact) =>
          (statusFilter === "replied" && contact.is_replied) ||
          (statusFilter === "pending" && !contact.is_replied)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((contact) => contact.category === categoryFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter, categoryFilter]);

  const handleReply = () => {
    if (!selectedContact || !replyMessage.trim()) {
      setReplyError("Reply message cannot be empty.");
      return;
    }

    setReplyError("");
    replyToContact({ id: selectedContact.id, replyMessage });
    setSelectedContact(null);
    setReplyMessage("");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCategoryFilter("all");
  };

  const closeReplyModal = () => {
    setSelectedContact(null);
    setReplyMessage("");
    setReplyError("");
  };

  const pendingCount = contacts.filter((contact) => !contact.is_replied).length;

  return {
    // State
    contacts,
    filteredContacts,
    isLoading,
    isError,
    error,
    searchTerm,
    statusFilter,
    categoryFilter,
    selectedContact,
    replyMessage,
    isReplying: isPending,
    replyError,
    pendingCount,
    // Handlers
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
    setSelectedContact,
    setReplyMessage,
    handleReply,
    resetFilters,
    closeReplyModal,
  };
};

// ================= USER FORM HOOK =================

// 5. Contact form state management
export const useContactForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const { mutate: submitForm } = useSubmitContactForm();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
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
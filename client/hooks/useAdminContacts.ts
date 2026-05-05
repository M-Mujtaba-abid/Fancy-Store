import { useState, useEffect } from "react";
import { useGetAllContacts, useReplyToContact } from "./useContact";
import { ContactMessage } from "@/types/contact.types";

export const useAdminContacts = () => {
  const { data: contacts = [], isLoading, isError, error } = useGetAllContacts();
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

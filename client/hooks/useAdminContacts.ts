import { useState, useEffect } from "react";
import { ContactMessage } from "@/types/contact.types";
import { getAllContacts, replyToContact } from "@/service/contactService/contact.service";
import toast from "react-hot-toast";

export const useAdminContacts = () => {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "replied">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Fetch contacts on mount
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAllContacts();
        setContacts(data);
      } catch (err: any) {
        setError(err.message || "Failed to load contact messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

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

  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      setReplyError("Reply message cannot be empty.");
      return;
    }

    try {
      setIsReplying(true);
      setReplyError("");

      await replyToContact(selectedContact.id, replyMessage);
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id ? { ...contact, is_replied: true } : contact
        )
      );
      
      toast.success("Reply sent successfully!");
      setSelectedContact(null);
      setReplyMessage("");
    } catch (err: any) {
      setReplyError(err.message || "Failed to send reply.");
      toast.error(err.message || "Failed to send reply.");
    } finally {
      setIsReplying(false);
    }
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
    loading,
    error,
    searchTerm,
    statusFilter,
    categoryFilter,
    selectedContact,
    replyMessage,
    isReplying,
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

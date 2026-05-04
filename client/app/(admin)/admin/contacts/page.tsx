"use client";
import React, { useEffect, useState } from "react";
import {
  Mail,
  X,
  Send,
  Filter,
  Search,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { getAllContacts, replyToContact, ContactMessage } from "@/service/contactService/contact.service";

export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "replied">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Reply modal states
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Fetch contacts
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAllContacts();
        setContacts(data);
      } catch (err: any) {
        setError(err.message || "Failed to load contacts");
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = contacts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (c) =>
          (statusFilter === "replied" && c.is_replied) ||
          (statusFilter === "pending" && !c.is_replied)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((c) => c.category === categoryFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, statusFilter, categoryFilter]);

  // Handle reply submission
  const handleReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      setReplyError("Reply message cannot be empty");
      return;
    }

    try {
      setIsReplying(true);
      setReplyError("");

      await replyToContact(selectedContact.id, replyMessage);

      // Optimistic update: Update the contact in state to show replied status
      setContacts(
        contacts.map((c) =>
          c.id === selectedContact.id ? { ...c, is_replied: true } : c
        )
      );

      // Close modal and reset
      setSelectedContact(null);
      setReplyMessage("");
    } catch (err: any) {
      setReplyError(err.message || "Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: "General",
      order_issue: "Order Issue",
      payment: "Payment",
      return_refund: "Return/Refund",
      other: "Other",
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
      order_issue: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
      payment: "bg-red-500/10 text-red-400 border border-red-500/30",
      return_refund: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
      other: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-main mb-2">Contact Messages</h1>
          <p className="text-text-muted">
            {filteredContacts.length} of {contacts.length} messages
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-6 mb-6 border border-border-custom/50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border-custom rounded-lg text-text-main placeholder-text-muted focus:border-primary focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-background border border-border-custom rounded-lg text-text-main focus:border-primary focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="replied">Replied</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border-custom rounded-lg text-text-main focus:border-primary focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="general">General Inquiry</option>
                <option value="order_issue">Order Issue</option>
                <option value="payment">Payment Problem</option>
                <option value="return_refund">Return / Refund</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="text-red-400" size={20} />
            <span className="text-red-400">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-text-muted mt-4">Loading contacts...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredContacts.length === 0 && (
          <div className="bg-card rounded-lg p-12 text-center border border-border-custom/50">
            <Mail className="mx-auto text-text-muted mb-4" size={48} />
            <p className="text-text-muted text-lg">No messages found</p>
          </div>
        )}

        {/* Contacts List */}
        {!loading && filteredContacts.length > 0 && (
          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-card rounded-lg border border-border-custom/50 overflow-hidden hover:border-border-custom transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text-main">
                          {contact.name}
                        </h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${getCategoryColor(
                            contact.category
                          )}`}
                        >
                          {getCategoryLabel(contact.category)}
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            contact.is_replied
                              ? "bg-green-500/10 text-green-400 border border-green-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {contact.is_replied ? "✓ Replied" : "⚠ Pending"}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mb-2">{contact.email}</p>
                      <p className="text-sm text-text-muted">
                        {new Date(contact.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedContact(
                          selectedContact?.id === contact.id ? null : contact
                        )
                      }
                      className="text-text-muted hover:text-primary transition-colors"
                    >
                      <ChevronDown
                        size={20}
                        className={`transform transition-transform ${
                          selectedContact?.id === contact.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Subject */}
                  <p className="text-sm font-medium text-text-main mb-3">
                    Subject: {contact.subject || "No subject"}
                  </p>

                  {/* Message Content (when expanded) */}
                  {selectedContact?.id === contact.id && (
                    <div className="mt-6 pt-6 border-t border-border-custom/50 space-y-4">
                      {/* Original Message */}
                      <div className="bg-background/50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-text-muted mb-2 uppercase">
                          Customer Message
                        </p>
                        <p className="text-text-main text-sm leading-relaxed whitespace-pre-wrap">
                          {contact.message}
                        </p>
                      </div>

                      {/* Reply Box (only show if not replied) */}
                      {!contact.is_replied && (
                        <div className="bg-background/50 rounded-lg p-4 space-y-3">
                          <p className="text-xs font-semibold text-primary uppercase">
                            Send Reply
                          </p>
                          <textarea
                            placeholder="Type your reply message here..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full h-32 px-4 py-3 bg-background border border-border-custom rounded-lg text-text-main placeholder-text-muted focus:border-primary focus:outline-none resize-none"
                          />

                          {replyError && (
                            <p className="text-sm text-red-400">{replyError}</p>
                          )}

                          <div className="flex gap-2">
                            <button
                              onClick={handleReply}
                              disabled={isReplying || !replyMessage.trim()}
                              className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                            >
                              <Send size={16} />
                              {isReplying ? "Sending..." : "Send Reply"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Replied Status */}
                      {contact.is_replied && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <p className="text-sm text-green-400 flex items-center gap-2">
                            <span className="text-lg">✓</span> Reply sent to customer
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
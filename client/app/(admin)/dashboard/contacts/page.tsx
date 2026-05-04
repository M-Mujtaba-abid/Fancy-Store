"use client";
import React, { useEffect, useState } from "react";
import { Mail, Send, Search, AlertCircle, MessageSquare, X } from "lucide-react";
import { getAllContacts, replyToContact, ContactMessage } from "@/service/contactService/contact.service";

export default function AdminContacts() {
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
      setSelectedContact(null);
      setReplyMessage("");
    } catch (err: any) {
      setReplyError(err.message || "Failed to send reply.");
    } finally {
      setIsReplying(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      general: "General",
      order_issue: "Order Issue",
      payment: "Payment",
      return_refund: "Return / Refund",
      other: "Other",
    };

    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const styles: Record<string, string> = {
      general: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
      order_issue: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
      payment: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
      return_refund: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
      other: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
    };

    return styles[category] || styles.general;
  };

  const pendingCount = contacts.filter((contact) => !contact.is_replied).length;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
              <MessageSquare size={32} className="text-primary" />
              Contact Messages
            </h1>
            <p className="text-text-muted mt-2">
              {filteredContacts.length} of {contacts.length} messages
              {pendingCount > 0 && (
                <span className="text-orange-400 font-semibold ml-2">• {pendingCount} pending</span>
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-background p-4 border border-border/50">
            <p className="text-sm text-text-muted uppercase tracking-[0.2em]">Pending Replies</p>
            <p className="text-3xl font-black text-text-main mt-2">{pendingCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-text-muted" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-2xl border border-border/50 bg-background py-3 pl-11 pr-4 text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-2xl border border-border/50 bg-background px-4 py-3 text-text-main focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-2xl border border-border/50 bg-background px-4 py-3 text-text-main focus:border-primary focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="general">General Inquiry</option>
            <option value="order_issue">Order Issue</option>
            <option value="payment">Payment Problem</option>
            <option value="return_refund">Return / Refund</option>
            <option value="other">Other</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setCategoryFilter("all");
            }}
            className="rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-sm text-red-400">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm">
              <div className="space-y-3">
                <div className="h-4 w-1/3 rounded-full bg-background animate-pulse" />
                <div className="h-3 w-1/2 rounded-full bg-background animate-pulse" />
                <div className="h-3 w-2/3 rounded-full bg-background animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredContacts.length === 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center shadow-sm">
          <Mail className="mx-auto mb-4 text-text-muted" size={48} />
          <p className="text-lg font-semibold text-text-main">No contact messages found</p>
          <p className="mt-2 text-sm text-text-muted">Try a different search or check back later.</p>
        </div>
      )}

      {!loading && filteredContacts.length > 0 && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background/50 border-b border-border/50 text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-background/50 transition-colors group">
                      <td className="p-4 font-medium text-text-main">{contact.name}</td>
                      <td className="p-4 text-text-muted">{contact.email}</td>
                      <td className="p-4">
                        <span className={`text-xs rounded-full px-2 py-1 font-medium ${getCategoryColor(contact.category)}`}>
                          {getCategoryLabel(contact.category)}
                        </span>
                      </td>
                      <td className="p-4 text-text-main max-w-xs truncate">{contact.subject || "—"}</td>
                      <td className="p-4 text-text-muted">{new Date(contact.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`text-xs rounded-full px-2 py-1 font-medium ${contact.is_replied ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                          {contact.is_replied ? "✓ Replied" : "⚠ Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedContact(contact)}
                          className="rounded-2xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                        >
                          Reply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-text-main truncate">{contact.name}</h3>
                      <p className="text-sm text-text-muted truncate">{contact.email}</p>
                    </div>
                    <span className={`text-xs rounded-full px-2 py-1 font-medium ${contact.is_replied ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                      {contact.is_replied ? "✓ Replied" : "Pending"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs rounded-full px-2 py-1 font-medium ${getCategoryColor(contact.category)}`}>
                      {getCategoryLabel(contact.category)}
                    </span>
                    <span className="text-xs text-text-muted">{new Date(contact.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-text-main">{contact.subject || "No subject"}</p>
                  <button
                    onClick={() => setSelectedContact(contact)}
                    className="w-full rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-border/50 bg-card shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-border/50 bg-background px-6 py-5">
              <div>
                <h2 className="text-2xl font-bold text-text-main">Reply to {selectedContact.name}</h2>
                <p className="text-sm text-text-muted">{selectedContact.email}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedContact(null);
                  setReplyMessage("");
                  setReplyError("");
                }}
                className="rounded-full p-2 text-text-muted hover:bg-background/80 hover:text-text-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-3xl border border-border/50 bg-background p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted mb-3">Original Message</p>
                <p className="text-sm leading-relaxed text-text-main whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              {!selectedContact.is_replied ? (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-text-main">Your Reply</label>
                  <textarea
                    rows={6}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full rounded-2xl border border-border/50 bg-background px-4 py-3 text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none resize-none"
                    placeholder="Type a reply message here..."
                  />

                  {replyError && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                      {replyError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleReply}
                      disabled={isReplying || !replyMessage.trim()}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
                    >
                      {isReplying ? (
                        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Send size={16} />
                      )}
                      {isReplying ? "Sending..." : "Send Reply"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContact(null);
                        setReplyMessage("");
                        setReplyError("");
                      }}
                      className="rounded-2xl border border-border/50 bg-background px-5 py-3 text-sm font-semibold text-text-main hover:bg-background/90"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-green-500/30 bg-green-500/10 p-5 text-sm text-green-500">
                  Reply already sent to <span className="font-semibold text-green-500">{selectedContact.email}</span>.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

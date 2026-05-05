import type { ContactCategory } from "@/types/contact.types";

export const CONTACT_CATEGORIES: { value: ContactCategory; label: string }[] = [
  { value: "general", label: "General Inquiry" },
  { value: "order_issue", label: "Order Issue" },
  { value: "payment", label: "Payment Problem" },
  { value: "return_refund", label: "Return / Refund" },
  { value: "other", label: "Other" },
];

export const CONTACT_CATEGORY_COLORS: Record<string, string> = {
  general: "bg-gray-500/10 text-gray-400 border border-gray-500/30",
  order_issue: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
  payment: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
  return_refund: "bg-blue-500/10 text-blue-400 border border-blue-500/30",
  other: "bg-purple-500/10 text-purple-400 border border-purple-500/30",
};

export const CONTACT_CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  order_issue: "Order Issue",
  payment: "Payment",
  return_refund: "Return / Refund",
  other: "Other",
};

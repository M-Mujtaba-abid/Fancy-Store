"use client";

import { ORDER_STATUSES } from "@/constants/orderStatusData";
import { useUpdateOrderStatus } from "@/hooks/useOrders";
import React from "react";
// import { useUpdateOrderStatus, ORDER_STATUSES } from "@/hooks/useOrders"; // Apna sahi path check kar lein

interface UpdateOrderStatusProps {
  orderId: string | number;
  currentStatus: string;
}

export const UpdateOrderStatus = ({ orderId, currentStatus }: UpdateOrderStatusProps) => {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus !== currentStatus) {
      // ✅ API call for update. (Make sure your service expects this structure e.g., { id, status })
      updateStatus({ id: orderId, status: newStatus });
    }
  };

  // Status ke hisaab se color return karne ka helper function
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-orange-100 text-orange-700 border-orange-200";
      case "accepted": return "bg-blue-100 text-blue-700 border-blue-200";
      case "ready_to_ship": return "bg-purple-100 text-purple-700 border-purple-200";
      case "shipped": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "delivered": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="relative inline-block w-full min-w-[140px]">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className={`w-full appearance-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border shadow-sm outline-none cursor-pointer transition-colors ${getStatusColor(currentStatus)} ${isPending ? "opacity-50 cursor-not-allowed" : "hover:brightness-95"}`}
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status} className="text-gray-900 bg-white">
            {status.replace(/_/g, " ")} {/* ready_to_ship ko ready to ship banata hai */}
          </option>
        ))}
      </select>
      
      {/* Custom Dropdown Arrow or Spinner */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        {isPending ? (
          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70" />
        ) : (
          <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
};
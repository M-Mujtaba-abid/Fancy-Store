"use client";

import React, { useState } from "react";
import Loading from "@/app/loading";
import { useAllOrders } from "@/hooks/useOrders"; 
import { UpdateOrderStatus } from "./UpdateOrderStatus";
import OrderDetails from "./OrderDetails"; // ✅ Naya component import kiya
import { Package, Calendar, User } from "lucide-react";

const ShowOrders = () => {
  const { data, isLoading, isError } = useAllOrders();
  
  // ✅ Modal kholne ke liye state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  if (isLoading) return <Loading />;

  if (isError) {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
        <p className="text-error text-sm font-semibold">Failed to fetch orders. Please try again.</p>
      </div>
    );
  }

  // Handle case where orders are paginated vs simple array
  const orders = Array.isArray(data) ? data : data?.orders || data?.data || [];

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card rounded-2xl p-6 shadow-sm border border-border/50">
        <div>
          <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
            <Package className="text-primary" /> All Orders
          </h2>
          <p className="text-sm text-text-muted mt-1">
            Manage customer orders and update shipping statuses. Total: {orders.length} orders
          </p>
        </div>
      </div>

      {/* --- ORDERS TABLE --- */}
      <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/50 border-b border-border/50 text-text-muted uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-background/50 transition-colors group">
                    
                    {/* Order ID */}
                    <td className="p-4 font-semibold text-text-main">
                      #{order.id.toString().padStart(5, '0')}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="opacity-70" />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </div>
                    </td>

                    {/* ✅ FIX: Customer Name from fullName */}
                    <td className="p-4 text-text-main">
                      <div className="flex items-center gap-2">
                        <User size={14} className="opacity-70 text-primary" />
                        <span className="font-medium capitalize">
                          {order.fullName || order.User?.name || "Guest User"}
                        </span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="p-4 text-text-main font-bold">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-text-muted">Rs.</span>
                        {order.totalAmount?.toLocaleString() || 0}
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <UpdateOrderStatus 
                        orderId={order.id} 
                        currentStatus={order.status} 
                      />
                    </td>

                    {/* ✅ View Details Button */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ CALLING THE MODAL */}
      {selectedOrder && (
        <OrderDetails 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}

    </div>
  );
};

export default ShowOrders;
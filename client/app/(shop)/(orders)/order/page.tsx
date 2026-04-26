"use client";

import React from "react";
import { useMyOrders } from "@/hooks/useOrders";
import { Package, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// Helper function status colors ke liye
const getStatusConfig = (status: string) => {
  switch (status) {
    case "pending": return { color: "text-yellow-600 bg-yellow-100", icon: Clock };
    case "processing": return { color: "text-blue-600 bg-blue-100", icon: Package };
    case "shipped": return { color: "text-purple-600 bg-purple-100", icon: Truck };
    case "delivered": return { color: "text-green-600 bg-green-100", icon: CheckCircle2 };
    case "cancelled": return { color: "text-red-600 bg-red-100", icon: XCircle };
    default: return { color: "text-gray-600 bg-gray-100", icon: Package };
  }
};

export default function MyOrdersPage() {
  const { data: orders, isLoading, isError } = useMyOrders();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading orders...</div>;
  if (isError) return <div className="min-h-screen flex items-center justify-center text-red-500">Please login to view orders.</div>;

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <Package size={80} className="text-gray-200 mb-4" />
        <h2 className="text-2xl font-bold mb-2">No orders found</h2>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <Link href="/shop" className="bg-primary text-white px-6 py-2 rounded-full">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-text-main">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const StatusIcon = getStatusConfig(order.status).icon;
          
          return (
            <div key={order.id} className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/50 pb-4 mb-4 gap-4">
                <div>
                  <p className="text-sm text-text-muted mb-1">Order <span className="font-mono">#{order.id.substring(0, 8).toUpperCase()}</span></p>
                  <p className="text-xs text-text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${getStatusConfig(order.status).color}`}>
                  <StatusIcon size={16} />
                  {order.status}
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                {order.OrderItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-lg overflow-hidden shrink-0 border border-border">
                      <Image src={item.Product?.imageUrl || "/placeholder.png"} alt="Product" fill className="object-cover" />
                    </div>
                    <div className="flex-grow">
                      <Link href={`/products/${item.productId}`} className="font-semibold text-text-main hover:text-primary line-clamp-1">
                        {item.Product?.name || "Product Name"}
                      </Link>
                      <p className="text-sm text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold">
                      Rs. {item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="mt-6 pt-4 border-t border-border/50 flex justify-between items-center">
                <span className="text-text-muted font-medium">Payment: {order.paymentMethod.toUpperCase()}</span>
                <div className="text-right">
                  <p className="text-sm text-text-muted">Total Amount</p>
                  <p className="text-xl font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
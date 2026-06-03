"use client";

import React from "react";
import { X, MapPin, Phone, Mail, CreditCard, Package, Calendar, Printer } from "lucide-react";
import { generateShippingLabel } from "@/utils/generateShippingLabel";

interface OrderDetailsProps {
  order: any; // Aap isko proper type bhi de sakte hain agar bani hui hai
  onClose: () => void;
}

const OrderDetails = ({ order, onClose }: OrderDetailsProps) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative custom-scrollbar border border-border/50 flex flex-col">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 sticky top-0 bg-card z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                Order #{order.id.toString().padStart(5, '0')}
              </h2>
              <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(order.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium", timeStyle: "short"
                })}
              </p>
            </div>
            <button 
              onClick={() => generateShippingLabel(order)}
              className="px-4 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors flex items-center gap-2 ml-4"
            >
              <Printer size={16} />
              Print Label
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-background border border-border rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Customer Info */}
            <div className="bg-background p-5 rounded-2xl border border-border/50">
              <h3 className="text-sm font-bold text-text-main mb-4 uppercase tracking-wider">Customer Info</h3>
              <div className="space-y-3">
                <p className="text-sm flex items-center gap-3 text-text-main">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {order.fullName?.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-semibold">{order.fullName || order.User?.name}</span>
                </p>
                <p className="text-sm flex items-center gap-3 text-text-muted">
                  <Mail size={16} className="text-primary" /> {order.email}
                </p>
                <p className="text-sm flex items-center gap-3 text-text-muted">
                  <Phone size={16} className="text-primary" /> {order.phoneNumber}
                </p>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-background p-5 rounded-2xl border border-border/50">
              <h3 className="text-sm font-bold text-text-main mb-4 uppercase tracking-wider">Shipping Details</h3>
              <div className="space-y-3">
                <div className="text-sm flex items-start gap-3 text-text-muted">
                  <MapPin size={16} className="text-primary mt-0.5 shrink-0" /> 
                  <span>
                    {order.address}, <br />
                    {order.city}, {order.postalCode} <br />
                    {order.country}
                  </span>
                </div>
                <div className="text-sm flex items-center gap-3 text-text-muted pt-2 border-t border-border/50">
                  <CreditCard size={16} className="text-primary" /> 
                  Payment Method: <span className="font-bold text-text-main uppercase">{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="bg-background rounded-2xl border border-border/50 overflow-hidden">
            <div className="p-4 bg-card border-b border-border/50">
              <h3 className="text-sm font-bold text-text-main flex items-center gap-2 uppercase tracking-wider">
                <Package size={16} /> Purchased Items ({order.OrderItems?.length || 0})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-text-muted text-xs uppercase">
                  <tr>
                    <th className="p-4 font-semibold">Item Details</th>
                    <th className="p-4 font-semibold text-center">Price</th>
                    <th className="p-4 font-semibold text-center">Qty</th>
                    <th className="p-4 font-semibold text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {order.OrderItems?.map((item: any) => (
                    <tr key={item.id} className="hover:bg-card/50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-text-main">Product ID: {item.productId}</p>
                      </td>
                      <td className="p-4 text-center text-text-muted">Rs. {item.price.toLocaleString()}</td>
                      <td className="p-4 text-center text-text-main font-bold">x{item.quantity}</td>
                      <td className="p-4 text-right text-primary font-bold">Rs. {(item.price * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* --- FOOTER (Total Amount) --- */}
        <div className="p-6 border-t border-border/50 bg-card rounded-b-3xl flex items-center justify-between">
          <span className="text-text-muted font-medium">Order Status: <strong className="text-text-main uppercase">{order.status.replace(/_/g, " ")}</strong></span>
          <div className="text-right">
            <p className="text-sm text-text-muted mb-1">Total Amount</p>
            <p className="text-2xl font-black text-primary">Rs. {order.totalAmount.toLocaleString()}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrderDetails;
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useOrders";
import { Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData, isLoading: isCartLoading } = useGetCart();
  const { mutate: placeOrder, isPending: isPlacingOrder } = usePlaceOrder();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Pakistan", // Default
    paymentMethod: "COD", // Cash on Delivery default
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    placeOrder(formData, {
      onSuccess: (res: any) => {
        // ✅ Order success hone par Order ID ke sath redirect karein
        router.push(`/order-success?orderId=${res.orderId}`);
      }
    });
  };

  if (isCartLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  // Agar cart khali hai toh wapas bhej dein
  if (!cartData?.items || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty!</h2>
        <Link href="/shop" className="bg-primary text-white px-6 py-2 rounded-full hover:opacity-90">
          Go to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-text-main">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT: Delivery Details Form */}
        <div className="lg:col-span-2 bg-card p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm">
          <h2 className="text-xl font-bold mb-6 border-b border-border/50 pb-4">Delivery Information</h2>
          
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Full Name *</label>
                <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Phone Number *</label>
                <input required type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-1">Street Address *</label>
              <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">City *</label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Postal Code *</label>
                <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1">Country *</label>
                <input required type="text" name="country" value={formData.country} readOnly className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-border outline-none cursor-not-allowed" />
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="pt-6 mt-6 border-t border-border/50">
              <h3 className="text-lg font-bold mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 p-4 border-2 border-primary bg-primary/5 rounded-xl cursor-pointer">
                <input type="radio" id="cod" name="paymentMethod" value="cod" checked={formData.paymentMethod === "COD"} onChange={handleChange} className="w-5 h-5 accent-primary" />
                <label htmlFor="cod" className="font-medium cursor-pointer w-full">Cash on Delivery (COD)</label>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="bg-card p-6 md:p-8 rounded-3xl border border-border/50 shadow-sm h-fit sticky top-28">
          <h2 className="text-xl font-bold mb-6 border-b border-border/50 pb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 no-scrollbar">
            {cartData.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-text-muted truncate pr-4">{item.quantity}x {item.name}</span>
                <span className="font-medium">Rs. {item.itemTotal.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-border/50 pt-4 mb-6">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-text-main">Rs. {cartData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Shipping</span>
              <span className="text-green-500 font-medium">Free</span>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-black text-primary">Rs. {cartData.subtotal.toLocaleString()}</span>
          </div>

          {/* ✅ Submit Button (Form ke bahar hai isliye form="checkout-form" lagaya hai) */}
          <button 
            type="submit" 
            form="checkout-form"
            disabled={isPlacingOrder}
            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:opacity-90 hover:scale-[1.02] transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isPlacingOrder ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle size={20} /> Place Order</>}
          </button>
        </div>

      </div>
    </div>
  );
}
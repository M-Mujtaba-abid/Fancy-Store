"use client";

import React from "react";
import { useGetCart, useUpdateCartItem, useClearCart } from "@/hooks/useCart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import Loading from "@/app/loading";

export default function CartPage() {
  const { data: cartData, isLoading, isError } = useGetCart();
  const { mutate: updateItem } = useUpdateCartItem();
  const { mutate: clearCart } = useClearCart();

  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading/>
      </div>
    );
  }

  // Handle Unauthorized / Not Logged In
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <ShoppingBag size={60} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Login</h2>
        <p className="text-gray-500 mb-6">
          You need to login to view your cart.
        </p>
        <Link
          href="/login"
          className="bg-primary text-white px-6 py-2 rounded-full"
        >
          Login Now
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center pt-8 text-center bg-background">
        <ShoppingBag size={80} className="text-gray-200 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">
          Looks like you have not added anything yet.
        </p>
        <Link
          href="/products"
          className="bg-primary text-white px-8 py-3 rounded-full font-bold"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-16 bg-background max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2 text-text-main">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-text-muted">
              {items.length} Items
            </span>
            <button
              onClick={() => clearCart()}
              className="text-red-500 hover:underline text-sm font-medium"
            >
              Clear All
            </button>
          </div>

          {items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex gap-4 bg-card p-4 rounded-2xl border border-border/50 shadow-sm"
            >
              {/* Image */}
              <div className="relative w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={item.image || "/placeholder.png"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col grow justify-between">
                <div className="flex justify-between items-start">
                  <Link
                    href={`/products/${item.productId}`}
                    className="font-bold text-lg hover:text-primary line-clamp-1"
                  >
                    {item.name}
                  </Link>
                  <span className="font-bold text-lg">
                    Rs. {item.itemTotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-end mt-4">
                  {/* Quantity Controls (Instant Update) */}
                  <div className="flex items-center gap-3 bg-background border border-border/50 rounded-full px-3 py-1">
                    <button
                      onClick={() =>
                        updateItem({
                          productId: item.productId,
                          quantity: item.quantity - 1,
                        })
                      }
                      className="text-gray-500 hover:text-primary transition"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-4 text-center select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // ✅ Check lagaya: Agar quantity stock tak pohoch gayi hai, toh toast dikhao
                        if (item.quantity >= item.availableStock) {
                          toast.error(
                            `Only ${item.availableStock} items available in stock!`,
                          );
                        } else {
                          // ✅ Agar stock bacha hai, tabhi hook (API) ko call karo
                          updateItem({
                            productId: item.productId,
                            quantity: item.quantity + 1,
                          });
                        }
                      }}
                      // ✅ Yahan se disabled attribute aur disabled:opacity-30 nikal diya hai
                      className="text-gray-500 hover:text-primary transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button (Quantity 0 bhejte hi API item remove kar degi) */}
                  <button
                    onClick={() =>
                      updateItem({ productId: item.productId, quantity: 0 })
                    }
                    className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-full transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm h-fit sticky top-[195px]">
          <h2 className="text-xl font-bold mb-6 border-b border-border/50 pb-4">
            Order Summary
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-text-muted">
              <span>Subtotal</span>
              <span className="font-medium text-text-main">
                Rs. {subtotal.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-text-muted">
              <span>Shipping</span>
              <span className="text-green-500 font-medium">Free</span>
            </div>
          </div>

          <div className="border-t border-border/50 pt-4 mb-8 flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-2xl font-black text-primary">
              Rs. {subtotal.toLocaleString()}
            </span>
          </div>

          <Link
            href="/checkout"
            className="w-full py-4 px-7 bg-primary text-white rounded-xl font-bold hover:opacity-90 hover:scale-[1.02] transition-all shadow-md"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Box, ClipboardList, Users, TrendingUp, Star } from "lucide-react";
import { useGetDashboardStats } from "@/hooks/useAdmin"; // Apna sahi path check kar lein

export default function DashboardSummary() {
  //  Hook se live data, loading aur error states nikal lein
  const { data, isLoading, isError } = useGetDashboardStats();

  // Data extract karein
  const stats = data?.data;

  // 🔄 Loading State
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // ⚠️ Error State
  if (isError) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500 font-semibold bg-red-500/10 px-6 py-4 rounded-xl">
          Failed to load dashboard statistics.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">Dashboard Summary</h1>
        <p className="text-text-muted mt-1">Overview of your stores performance today.</p>
      </div>

      {/* 🎯 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Products */}
        <Link
          href="/dashboard/products"
          className="group bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] hover:shadow-md duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="p-4 bg-primary/10 text-primary rounded-xl shrink-0">
            <Box size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Total Products</p>
            <h2 className="text-3xl font-black text-text-main">
              {stats?.totalProducts?.toLocaleString() || 0}
            </h2>
          </div>
          <ArrowRight
            size={20}
            className="text-text-muted shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        </Link>

        {/* Total Orders */}
        <Link
          href="/dashboard/orders"
          className="group bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] hover:shadow-md duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="p-4 bg-green-500/10 text-green-500 rounded-xl shrink-0">
            <ClipboardList size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Total Orders</p>
            <h2 className="text-3xl font-black text-text-main">
              {stats?.totalOrders?.toLocaleString() || 0}
            </h2>
          </div>
          <ArrowRight
            size={20}
            className="text-text-muted shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        </Link>

        {/* Total Users */}
        <Link
          href="/dashboard/users"
          className="group bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] hover:shadow-md duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl shrink-0">
            <Users size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Registered Users</p>
            <h2 className="text-3xl font-black text-text-main">
              {stats?.totalUsers?.toLocaleString() || 0}
            </h2>
          </div>
          <ArrowRight
            size={20}
            className="text-text-muted shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        </Link>

        {/* Total Reviews */}
        <Link
          href="/dashboard/review"
          className="group bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4 transition-transform hover:scale-[1.02] hover:shadow-md duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
            <Star size={28} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Total Reviews</p>
            <h2 className="text-3xl font-black text-text-main">
              {stats?.totalReviews?.toLocaleString() || 0}
            </h2>
          </div>
          <ArrowRight
            size={20}
            className="text-text-muted shrink-0 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100"
            aria-hidden
          />
        </Link>

      </div>

      {/* A placeholder for future charts */}
      <div className="mt-8 bg-card p-6 rounded-2xl border border-border/50 shadow-sm h-64 flex flex-col items-center justify-center text-text-muted">
        <TrendingUp size={48} className="opacity-20 mb-4" />
        <p className="font-semibold">Sales Chart will appear here</p>
      </div>
    </div>
  );
}
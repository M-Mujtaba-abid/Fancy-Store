"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Box, ClipboardList, DollarSign, Package, Star, TrendingUp, Users } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useGetDashboardStats, useGetLowStockProducts, useGetProfitSummary, useGetSalesChart } from "@/hooks/useAdmin";

const currency = (value = 0) => `Rs. ${value.toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;

export default function DashboardSummary() {
  const statsQuery = useGetDashboardStats();
  const profitQuery = useGetProfitSummary();
  const chartQuery = useGetSalesChart();
  const lowStockQuery = useGetLowStockProducts();

  if (statsQuery.isLoading) {
    return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  if (statsQuery.isError) {
    return <div className="flex min-h-[50vh] items-center justify-center"><div className="rounded-xl bg-red-500/10 px-6 py-4 font-semibold text-red-500">Failed to load dashboard statistics.</div></div>;
  }

  const stats = statsQuery.data?.data;
  const profit = profitQuery.data?.data;
  const chart = chartQuery.data?.data || [];
  const lowStock = lowStockQuery.data?.data || [];
  const cards = [
    { label: "Total Products", value: stats?.totalProducts, href: "/dashboard/products", icon: Box, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Orders", value: stats?.totalOrders, href: "/dashboard/orders", icon: ClipboardList, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Cancelled Orders", value: stats?.cancelledOrders, href: "/dashboard/orders", icon: Package, color: "text-red-500", bg: "bg-red-500/10", detail: `${stats?.cancellationRate || 0}% cancellation rate` },
    { label: "Total Revenue", value: currency(profit?.totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Net Profit", value: currency(profit?.netProfit), icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", detail: `${profit?.profitMargin || 0}% margin` },
    { label: "Registered Users", value: stats?.totalUsers, href: "/dashboard/users", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Total Reviews", value: stats?.totalReviews, href: "/dashboard/review", icon: Star, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <main className="mx-auto w-full max-w-370 space-y-8 pb-8">
      <header className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Store intelligence</p>
        <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">Dashboard Summary</h1>
        <p className="text-sm text-text-muted sm:text-base">A clear view of your store&apos;s performance.</p>
      </header>

      <section aria-label="Store statistics" className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] items-stretch gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const content = (
            <div className="flex min-h-28 h-full items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-shadow group-hover:shadow-[0_12px_30px_rgba(15,23,42,0.09)]">
              <div className={`shrink-0 rounded-xl p-3.5 ${card.bg} ${card.color}`}><Icon size={23} strokeWidth={2.2} /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-muted">{card.label}</p>
                <h2 className="mt-1 truncate text-xl font-black tracking-tight text-text-main sm:text-2xl">{card.value ?? 0}</h2>
                {card.detail && <p className="mt-1 text-xs text-text-muted">{card.detail}</p>}
              </div>
              {card.href && <ArrowRight size={18} className="shrink-0 text-text-muted transition-transform group-hover:translate-x-1" aria-hidden />}
            </div>
          );
          return card.href ? <Link key={card.label} href={card.href} className="group block h-full min-w-0">{content}</Link> : <div key={card.label} className="h-full min-w-0">{content}</div>;
        })}
      </section>

      <section className="grid min-w-0 grid-cols-1 items-stretch gap-6 2xl:grid-cols-[minmax(0,1.85fr)_minmax(320px,1fr)]">
        <article className="min-w-0 overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-bold text-text-main sm:text-xl">Revenue, last 30 days</h2><p className="mt-1 text-sm text-text-muted">Delivered orders only</p></div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">Revenue</span>
          </div>
          <div className="h-65 min-w-0 sm:h-82.5">
            {chart.length === 0 ? <div className="flex h-full items-center justify-center text-sm text-text-muted">No revenue data available.</div> : <ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ top: 8, right: 4, left: -18, bottom: 4 }}><CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} /><XAxis dataKey="date" tickFormatter={(date) => date.slice(5)} tick={{ fontSize: 11 }} tickMargin={8} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `${Math.round(value / 1000)}k`} width={42} /><Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} formatter={(value) => currency(Number(value))} labelFormatter={(date) => `Date: ${date}`} /><Line type="monotone" dataKey="revenue" stroke="#0f766e" strokeWidth={3} dot={false} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer>}
          </div>
        </article>

        <article className="flex min-w-0 min-h-90 flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:p-6 2xl:min-h-0">
          <div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-text-main sm:text-xl">Low Stock Products</h2><p className="mt-1 text-sm text-text-muted">Items below 5 units</p></div><div className="rounded-xl bg-red-500/10 p-2.5 text-red-500"><Package size={19} /></div></div>
          {lowStock.length === 0 ? <div className="flex flex-1 items-center justify-center py-8 text-center text-sm text-text-muted">All products have healthy stock.</div> : <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">{lowStock.map((product) => <div key={product.id} className="flex items-center justify-between gap-3 border-b border-border/40 py-3 first:pt-0 last:border-0"><div className="min-w-0"><p className="truncate font-semibold text-text-main">{product.name}</p><p className="mt-0.5 text-xs text-text-muted">Product #{product.id}</p></div><span className="shrink-0 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-500">{product.stockQuantity} left</span></div>)}</div>}
        </article>
      </section>
    </main>
  );
}

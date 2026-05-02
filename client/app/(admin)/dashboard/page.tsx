import React from "react";
import { Box, ClipboardList, Users, TrendingUp } from "lucide-react";

export default function DashboardSummary() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-main">Dashboard Summary</h1>
        <p className="text-text-muted mt-1">Overview of your store's performance today.</p>
      </div>

      {/* 🎯 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Products */}
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-primary/10 text-primary rounded-xl">
            <Box size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Total Products</p>
            <h2 className="text-3xl font-black text-text-main">124</h2>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-500/10 text-green-500 rounded-xl">
            <ClipboardList size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Total Orders</p>
            <h2 className="text-3xl font-black text-text-main">45</h2>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-card p-6 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-500/10 text-orange-500 rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm text-text-muted font-bold uppercase tracking-wider">Registered Users</p>
            <h2 className="text-3xl font-black text-text-main">890</h2>
          </div>
        </div>

      </div>

      {/* A placeholder for future charts */}
      <div className="mt-8 bg-card p-6 rounded-2xl border border-border/50 shadow-sm h-64 flex flex-col items-center justify-center text-text-muted">
        <TrendingUp size={48} className="opacity-20 mb-4" />
        <p className="font-semibold">Sales Chart will appear here</p>
      </div>
    </div>
  );
}
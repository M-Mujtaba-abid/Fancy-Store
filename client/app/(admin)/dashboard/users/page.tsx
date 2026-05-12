"use client";

import React, { useMemo, useState } from "react";
import { AlertCircle, Search, Users } from "lucide-react";
import { useGetAllUsers } from "@/hooks/useAdmin";
import type { AdminUser } from "@/types/admin.type";

const AVATAR_FALLBACK =
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

function UserAvatar({ user }: { user: AdminUser }) {
  const [src, setSrc] = useState(user.avatar || AVATAR_FALLBACK);

  return (
    <img
      src={src || AVATAR_FALLBACK}
      alt=""
      className="h-10 w-10 rounded-full border border-border/50 bg-background object-cover"
      onError={() => setSrc(AVATAR_FALLBACK)}
    />
  );
}

export default function UsersPage() {
  const { data, isLoading, isError, error } = useGetAllUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const users = data?.data ?? [];

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text-main flex items-center gap-3">
              <Users size={32} className="text-primary" />
              User Management
            </h1>
            <p className="text-text-muted mt-2">
              {filteredUsers.length} of {users.length} users
              {searchTerm.trim() ? " (filtered)" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-3 text-text-muted" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email"
            className="w-full rounded-2xl border border-border/50 bg-background py-3 pl-11 pr-4 text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {isError && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-sm text-red-400">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} />
            <span>
              {(error as Error & { response?: { data?: { message?: string } } })
                ?.response?.data?.message ||
                (error instanceof Error ? error.message : null) ||
                "Failed to load users"}
            </span>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center min-h-[40vh] bg-card rounded-2xl border border-border/50 shadow-sm">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center shadow-sm">
          <Users className="mx-auto mb-4 text-text-muted" size={48} />
          <p className="text-lg font-semibold text-text-main">No users yet</p>
          <p className="mt-2 text-sm text-text-muted">
            Registered users will appear here.
          </p>
        </div>
      )}

      {!isLoading && !isError && users.length > 0 && filteredUsers.length === 0 && (
        <div className="bg-card rounded-2xl border border-border/50 p-12 text-center shadow-sm">
          <Search className="mx-auto mb-4 text-text-muted" size={48} />
          <p className="text-lg font-semibold text-text-main">No matching users</p>
          <p className="mt-2 text-sm text-text-muted">
            Try a different name or email search.
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredUsers.length > 0 && (
        <div className="space-y-4">
          <div className="hidden md:block bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background/50 border-b border-border/50 text-text-muted uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="p-4">Avatar</th>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-background/50 transition-colors"
                    >
                      <td className="p-4">
                        <UserAvatar user={user} />
                      </td>
                      <td className="p-4 font-medium text-text-main capitalize">
                        {user.name}
                      </td>
                      <td className="p-4 text-text-muted">{user.email}</td>
                      <td className="p-4">
                        <span
                          className={`text-xs rounded-full px-2 py-1 font-medium border ${
                            user.role === "admin"
                              ? "bg-primary/10 text-primary border-primary/30"
                              : "bg-background text-text-muted border-border/50"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden"
              >
                <div className="p-5 flex gap-4">
                  <UserAvatar user={user} />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-text-main truncate capitalize">
                        {user.name}
                      </h3>
                      <span
                        className={`text-xs rounded-full px-2 py-1 font-medium border shrink-0 ${
                          user.role === "admin"
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-background text-text-muted border-border/50"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted truncate">{user.email}</p>
                    <p className="text-xs text-text-muted">
                      Joined{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGetProfile } from "@/hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: profile, isLoading, error } = useGetProfile();
  const isAdmin = profile?.data?.role === "admin";

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (error || !profile) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [profile, isLoading, error, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return null;
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useGetProfile } from "@/hooks/useAuth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const { data: profile, isLoading, error } = useGetProfile();

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (isLoading) {
      return; // Wait for profile to load
    }

    if (error || !profile) {
      // Not authenticated or profile fetch failed
      console.warn("⚠️ Admin access denied - no profile");
      setIsAuthorized(false);
      router.push("/");
      return;
    }

    // ✅ Verify user is admin
    if (profile.data?.role === "admin") {
      console.log("✅ Admin verified - allowing dashboard access");
      setIsAuthorized(true);
    } else {
      console.warn("⚠️ Admin access denied - user is not admin");
      setIsAuthorized(false);
      router.push("/");
    }
  }, [profile, isLoading, error, router]);

  // Show nothing while verifying
  if (isAuthorized === null || isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Only render if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  return null;
}

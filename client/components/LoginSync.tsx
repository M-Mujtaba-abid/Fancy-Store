"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authService } from "@/service/authService/auth.service";
import { setAuthSession } from "@/utils/auth";
import { syncGuestDataOnLogin } from "@/utils/guestSync";

function SyncLogic() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    if (loginStatus !== "success") return;

    (async () => {
      setAuthSession("user");

      await syncGuestDataOnLogin();

      try {
        const profile = await authService.getProfile();
        const role = profile.data?.role || "user";
        setAuthSession(role);

        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        window.history.replaceState({}, document.title, window.location.pathname);
        toast.success("Logged in successfully!");

        if (role === "admin") {
          router.push("/dashboard");
        }
      } catch {
        toast.error("Login succeeded but profile could not be loaded. Please refresh.");
      }
    })();
  }, [searchParams, queryClient, router]);

  return null;
}

export default function LoginSync() {
  return (
    <Suspense fallback={null}>
      <SyncLogic />
    </Suspense>
  );
}

"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { syncGuestWishlistToServer } from "@/service/wishlistService/wishlist.service";

function SyncLogic() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    if (loginStatus === "success") {
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Logged in successfully!");

      syncGuestWishlistToServer().then(() => {
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      });

      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.reload();
    }
  }, [searchParams, queryClient]);

  return null; // Kuch dikhana nahi hai
}

export default function LoginSync() {
  return (
    <Suspense fallback={null}>
      <SyncLogic />
    </Suspense>
  );
}
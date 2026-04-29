"use client";
import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function SyncLogic() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const loginStatus = searchParams.get("login");
    if (loginStatus === "success") {
      // ✅ localStorage set karein
      localStorage.setItem("isLoggedIn", "true");
      toast.success("Logged in successfully!");
      
      // ✅ URL clean karein
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // ✅ Page refresh taake poori app ko pata chal jaye (Optional)
      window.location.reload(); 
    }
  }, [searchParams]);

  return null; // Kuch dikhana nahi hai
}

export default function LoginSync() {
  return (
    <Suspense fallback={null}>
      <SyncLogic />
    </Suspense>
  );
}
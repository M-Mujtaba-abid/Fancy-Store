"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/hooks/useAuth";
import { Loader, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register, isPending } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }
    register(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-lg floating-card">
        <h2 className="text-3xl font-bold text-center mb-6 text-text-main">
          Create Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-main">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="John Doe"
              className="w-full p-2 rounded-md bg-background text-text-main placeholder:text-text-muted transition-colors"
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-text-main">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="name@example.com"
              className="w-full p-2 rounded-md bg-background text-text-main placeholder:text-text-muted transition-colors"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div>
  <label className="block text-sm font-medium mb-1 text-text-main">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      required
      placeholder="••••••••"
      className="w-full p-2 pr-10 rounded-md bg-background text-text-main placeholder:text-text-muted transition-colors"
      onChange={(e) =>
        setFormData({ ...formData, password: e.target.value })
      }
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-primary transition-colors"
    >
      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
    </button>
  </div>
</div>
          <button
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2 rounded-md flex justify-center items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending && <Loader className="animate-spin w-4 h-4" />}
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

// src/components/shop/share/NavCartButton.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetCart } from "@/hooks/useCart";

const NavCartButton = () => {
  const { data: cartData } = useGetCart();
  const [mounted, setMounted] = useState(false);

  // Hydration error se bachne ke liye mounted check lazmi hai
  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = cartData?.items?.length || 0;

  return (
    <Link href="/cart" id="cart-icon-target" className="relative p-2 text-text-main hover:text-primary transition-colors">
      <ShoppingBag size={22} strokeWidth={1.5} />
      
      {/* Client-side mount hone ke baad hi animation chalao */}
      {mounted && (
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 bg-primary text-[10px] text-white font-bold h-4 w-4 flex items-center justify-center rounded-full overflow-hidden"
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={cartCount}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="block absolute"
                >
                  {cartCount}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Link>
  );
};

export default NavCartButton;
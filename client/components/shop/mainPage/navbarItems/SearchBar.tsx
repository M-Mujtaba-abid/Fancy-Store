"use client";
import { useEffect, useRef, useState } from "react";
import { X, Search as SearchIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchProducts } from "@/hooks/useProducts"; // 👈 Apna hook yahan import karein

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const searchRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // 1. Debouncing Logic (Taake har letter par API hit na ho)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 500); // 500ms ka delay

    return () => clearTimeout(timer);
  }, [inputValue]);

  // 2. React Query Hook Call
  const { data, isLoading } = useSearchProducts(debouncedQuery);

  // 3. Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleClose = () => {
    setInputValue(""); // Close hone par input clear kar dein
    setDebouncedQuery("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={searchRef}
      className="absolute right-0 top-full mt-2 z-50 w-[300px] sm:w-[350px] bg-card rounded-xl shadow-2xl border border-border/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Search Input Area */}
      <div className="w-full flex items-center gap-2 p-3 border-b border-border/50">
        <SearchIcon size={18} className="text-text-muted" />
        <input
          autoFocus
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search for products..."
          className="w-full bg-transparent border-none outline-none text-text-main text-sm placeholder:text-text-muted"
        />
        <button onClick={handleClose} className="p-1 hover:bg-background rounded-full transition-all text-text-muted hover:text-text-main">
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>

      {/* Results Area */}
      {inputValue.trim().length > 0 && (
        <div className="max-h-[300px] overflow-y-auto no-scrollbar bg-background">
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-primary">
              <Loader2 className="animate-spin" size={24} />
            </div>
          )}

          {/* Results List */}
          {!isLoading && data?.products && data.products.length > 0 && (
            <div className="flex flex-col py-2">
              {data.products.map((product: any) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  onClick={handleClose}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-card transition-colors"
                >
                  <div className="w-12 h-12 relative rounded-md overflow-hidden bg-white shrink-0">
                    <Image
                      src={product.imageUrl || (product.images && product.images[0]) || "/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium text-text-main truncate">{product.name}</span>
                    <span className="text-xs font-bold text-primary">Rs. {product.discountPrice || product.price}</span>
                  </div>
                </Link>
              ))}
              
              {/* See All Button (Agar 5 se ziada results hain toh View All page pe bhej dein) */}
              <Link 
                href={`/viewMore?search=${debouncedQuery}`} 
                onClick={handleClose}
                className="text-center text-xs font-medium text-primary hover:underline py-3 border-t border-border/50 mt-1 block"
              >
                View all results
              </Link>
            </div>
          )}

          {/* No Results Found */}
          {!isLoading && data?.products?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-text-muted">
              <span className="text-sm">No products found for "{debouncedQuery}"</span>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default SearchBar;
"use client";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={searchRef}
      className="absolute right-0 top-full mt-2 z-50 w-[200px] bg-background rounded-xl p-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="w-full flex items-center gap-1">
        <input
          autoFocus
          type="text"
          placeholder="Search..."
          className="w-full bg-transparent border-none outline-none text-text-main text-sm placeholder:text-text-muted px-2"
        />
        <button onClick={onClose} className="p-2 hover:bg-card rounded-full transition-all">
          <X size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
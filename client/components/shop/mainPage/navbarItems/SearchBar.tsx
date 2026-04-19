"use client";
import { X } from "lucide-react";

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchBar = ({ isOpen, onClose }: SearchBarProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-background flex items-center px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="max-w-7xl mx-auto w-full flex items-center">
        <input
          autoFocus
          type="text"
          placeholder="Search for premium products..."
          className="w-full bg-transparent border-none outline-none text-text-main text-lg placeholder:text-text-muted"
        />
        <button onClick={onClose} className="p-2 hover:bg-border-custom rounded-full transition-all">
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
"use client";

import React, { useState, useRef } from "react";
import { ChevronLeft } from "lucide-react";

interface ExpandableDescriptionProps {
  description: string;
  maxHeightInitial?: string; // Default: 160px
  maxHeightExpanded?: string; // Default: 4000px
}

const ExpandableDescription = ({
  description,
  maxHeightInitial = "160px",
  maxHeightExpanded = "4000px",
}: ExpandableDescriptionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleDescription = () => {
    if (isExpanded) {
      // Calculate position before closing
      const offset =
        containerRef.current!.getBoundingClientRect().top +
        window.scrollY -
        100;

      setIsExpanded(false);

      // Smooth scroll back to start
      window.scrollTo({
        top: offset,
        behavior: "smooth",
      });
    } else {
      setIsExpanded(true);
    }
  };

  const cleanDescription = description.replace(/&nbsp;/g, ' ');
  return (
    
    <div className="mb-8 w-full" ref={containerRef}>
      
      <p className="text-[11px] text-text-muted uppercase font-bold mb-2 tracking-wider">
        Product Description
      </p>

      <div className="relative break-normal">
        <div
          className="text-text-main break-normal leading-relaxed product-description transition-[max-height] duration-700 ease-in-out overflow-hidden"
          dangerouslySetInnerHTML={{ __html: cleanDescription }}
          style={{
            maxHeight: !isExpanded ? maxHeightInitial : maxHeightExpanded,
            transitionProperty: "max-height",
            transitionDuration: "700ms",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            wordBreak: "normal", // Ab ye "loo-k" nahi hone dega
            overflowWrap: "break-word",
            whiteSpace: "normal",
            hyphens: "none",
            WebkitHyphens: "none", // Safari support
          }}
        />

        {/* Bottom Fade Gradient - Only shows when collapsed */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none transition-opacity duration-500" />
        )}
      </div>

      <button
        onClick={toggleDescription}
        className="mt-4 text-primary font-bold text-sm hover:text-primary/80 flex items-center gap-1 group transition-colors"
      >
        {isExpanded ? (
          <>
            Show Less
            <ChevronLeft
              size={16}
              className="rotate-90 group-hover:-translate-y-0.5 transition-transform"
            />
          </>
        ) : (
          <>
            Read More
            <ChevronLeft
              size={16}
              className="-rotate-90 group-hover:translate-y-0.5 transition-transform"
            />
          </>
        )}
      </button>
    </div>
  );
};

export default ExpandableDescription;

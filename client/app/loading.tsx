"use client";

import React, { type ReactNode, useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";

interface LoadingProps {
  brandName?: string;
  brandAccent?: string;
  logo?: ReactNode;
  overlay?: boolean;
}

const Loading = ({
  brandName = "FANCY STORE",
  brandAccent = "STORE",
  logo,
  overlay = true,
}: LoadingProps) => {
  const progress = useMotionValue(0);
  const carPosition = useTransform(progress, [0, 1], ["6%", "94%"]);
  const roadFill = useTransform(progress, [0, 1], ["6%", "94%"]);

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: 2.8,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    });

    return () => controls.stop();
  }, [progress]);

  const brandWords = brandName.trim().split(/\s+/);
  const accentIndex = brandWords.findIndex((word) => word === brandAccent);

  return (
    <div
      className={`${overlay ? "fixed inset-0 z-[100]" : "relative min-h-[240px] w-full"} flex items-center justify-center overflow-hidden bg-background px-6 text-text-main transition-colors duration-300 dark:bg-slate-950`}
      role="status"
      aria-label={`${brandName} loading`}
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <div className="relative w-[min(78vw,250px)] pt-10">
          <motion.div
            className="absolute top-0 z-10 -translate-x-1/2"
            style={{ left: carPosition }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.35, ease: "easeInOut", repeat: Infinity }}
          >
            <svg
              aria-hidden="true"
              className="h-auto w-12 text-primary drop-shadow-md"
              viewBox="0 0 64 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 24h4l3.6-10.2A4 4 0 0 1 19.37 11h25.26a4 4 0 0 1 3.77 2.8L52 24h4a3 3 0 0 1 3 3v2H5v-2a3 3 0 0 1 3-3Z"
                className="fill-primary"
              />
              <path d="M20 13h24l2.2 7H17.8L20 13Z" className="fill-background/70" />
              <circle cx="17" cy="29" r="4" className="fill-slate-800 dark:fill-slate-200" />
              <circle cx="49" cy="29" r="4" className="fill-slate-800 dark:fill-slate-200" />
              <circle cx="17" cy="29" r="1.5" className="fill-background dark:fill-slate-950" />
              <circle cx="49" cy="29" r="1.5" className="fill-background dark:fill-slate-950" />
            </svg>
          </motion.div>

          <div className="relative h-2 w-full overflow-hidden rounded-full border border-border-custom bg-background dark:bg-slate-900">
            <div className="absolute inset-0 border-t-2 border-dashed border-border-custom/80" />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-primary"
              style={{ width: roadFill }}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          {logo ? (
            <div className="flex justify-center">{logo}</div>
          ) : (
            <p className="text-sm font-black uppercase tracking-[0.24em] text-text-main dark:text-white">
              {brandWords.map((word, index) => (
                <React.Fragment key={`${word}-${index}`}>
                  {index > 0 ? " " : ""}
                  <span className={index === accentIndex ? "italic text-primary" : undefined}>
                    {word}
                  </span>
                </React.Fragment>
              ))}
            </p>
          )}

          <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-primary"
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
                transition={{
                  duration: 1.1,
                  ease: "easeInOut",
                  repeat: Infinity,
                  delay: dot * 0.18,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;

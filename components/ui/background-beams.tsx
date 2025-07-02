"use client";
import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundBeams = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black"></div>
      <div
        style={{
          maskImage:
            "radial-gradient(ellipse at 50% 50%, #000 0%, transparent 50%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, #000 0%, transparent 50%)",
        } as React.CSSProperties}
        className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-transparent opacity-40"
      ></div>
      <div
        style={{
          maskImage:
            "radial-gradient(ellipse at 50% 50%, #000 0%, transparent 50%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 50%, #000 0%, transparent 50%)",
        } as React.CSSProperties}
        className="absolute inset-0 bg-gradient-to-r from-transparent to-indigo-500/30 opacity-40"
      ></div>
    </div>
  );
}; 
"use client";

import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AppLogo({ className, size = "md" }: AppLogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  };

  return (
    <div className={cn("flex items-center justify-center overflow-hidden", sizeClasses[size], className)}>
      {/* Light Mode Logo */}
      <img
        src="/assets/flowlog.png"
        alt="FlowLog"
        className="h-full w-auto object-contain dark:hidden"
      />
      {/* Dark Mode Logo (Placeholder for now, same as light until you provide one) */}
      <img
        src="/assets/flowlog-dark.png" // User should provide this file
        alt="FlowLog"
        className="hidden h-full w-auto object-contain dark:block"
        onError={(e) => {
          // Fallback if dark logo doesn't exist yet
          e.currentTarget.src = "/assets/flowlog.png";
          e.currentTarget.classList.remove("hidden");
        }}
      />
    </div>
  );
}

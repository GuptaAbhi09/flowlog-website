"use client";

import Image from "next/image";
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
      <Image
        src="/assets/flowlog.png"
        alt="FlowLog"
        width={200}
        height={64}
        className="h-full w-auto object-contain dark:hidden"
        priority
      />
      <Image
        src="/assets/flowlog-dark.png"
        alt="FlowLog"
        width={200}
        height={64}
        className="hidden h-full w-auto object-contain dark:block"
      />
    </div>
  );
}

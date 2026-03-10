import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "default" | "positive" | "warning" | "neutral";
}

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  default: "bg-[#eff7f3] text-moss",
  positive: "bg-[#e6f4ee] text-[#0d6b47]",
  warning: "bg-[#fbf1de] text-[#a36a17]",
  neutral: "bg-[#f1f3f0] text-[#55685d]"
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-ink text-white shadow-card hover:bg-[#0f2a20]",
  secondary: "bg-moss text-white shadow-card hover:bg-[#176549]",
  ghost: "bg-transparent text-ink hover:bg-white/80",
  outline: "border border-[rgba(21,50,39,0.1)] bg-white/70 text-ink hover:bg-white",
  danger: "bg-[#cf6a5d] text-white hover:bg-[#b85b4f]"
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base"
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none focus:ring-2 focus:ring-moss/30 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      type={type}
      {...props}
    />
  );
}

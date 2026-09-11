import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "tab" | "ghost" | "again" | "hard" | "good" | "easy";

const variants: Record<ButtonVariant, string> = {
  tab: "text-muted-foreground hover:bg-card hover:text-foreground",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  again: "bg-review-again text-review-again-foreground hover:brightness-95",
  hard: "bg-review-hard text-review-hard-foreground hover:brightness-95",
  good: "bg-review-good text-review-good-foreground hover:brightness-95",
  easy: "bg-review-easy text-review-easy-foreground hover:brightness-95",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  active?: boolean;
}

export function Button({
  className,
  variant = "ghost",
  active = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        active && "bg-card text-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
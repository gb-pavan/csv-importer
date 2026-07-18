import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(52,211,148,0.4)] hover:shadow-[0_0_30px_rgba(52,211,148,0.6)] border-none",
      secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
      ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-white/5",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "min-h-11 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 flex items-center justify-center gap-2 sm:px-6",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

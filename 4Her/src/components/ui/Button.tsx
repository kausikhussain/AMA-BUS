"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
    variant?: "primary" | "secondary" | "outline" | "danger";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export function Button({
    children,
    className,
    variant = "primary",
    size = "md",
    ...props
}: ButtonProps) {
    const variants = {
        primary: "bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(255,10,84,0.5)]",
        secondary: "bg-white/10 hover:bg-white/20 text-rose-200 border border-rose-500/30 backdrop-blur-md",
        outline: "border-2 border-rose-500 text-rose-500 hover:bg-rose-500/10",
        danger: "bg-red-500/80 hover:bg-red-600 text-white",
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-xl font-semibold",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "rounded-full transition-all duration-300 font-medium relative overflow-hidden group",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2 justify-center">
                {children}
            </span>
            {variant === "primary" && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
        </motion.button>
    );
}

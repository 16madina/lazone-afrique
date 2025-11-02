import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-elevation-1 hover:shadow-elevation-2 hover:scale-105",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gradient-to-br from-[hsl(48,100%,70%)] via-[hsl(45,100%,58%)] to-[hsl(42,95%,48%)] text-[hsl(25,40%,15%)] shadow-warm",
        secondary: "border-white/30 bg-white/80 dark:bg-white/10 text-foreground backdrop-blur-md",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-primary/40 bg-white/50 dark:bg-white/10 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

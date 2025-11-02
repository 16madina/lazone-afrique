import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 ease-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:saturate-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 ripple",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-[hsl(48,100%,70%)] via-[hsl(45,100%,58%)] to-[hsl(42,95%,48%)] text-[hsl(25,40%,15%)] shadow-elevation-2 hover:shadow-elevation-3 hover:scale-[1.02] font-bold",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-elevation-2 hover:shadow-elevation-3",
        outline: "border-2 border-primary/30 bg-white/50 dark:bg-black/20 backdrop-blur-md hover:bg-primary/10 hover:border-primary/50 shadow-elevation-1 hover:shadow-elevation-2",
        secondary: "bg-gradient-to-br from-white/90 to-white/70 dark:from-white/10 dark:to-white/5 text-foreground backdrop-blur-lg border border-white/40 shadow-elevation-2 hover:shadow-elevation-3",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground backdrop-blur-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        glass: "bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 text-foreground shadow-elevation-2 hover:bg-white/30 hover:shadow-elevation-3",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]";

        // Updated for Clean-Tech (Indigo/Slate)
        const variants = {
            primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 ring-indigo-500",
            secondary: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-500",
            outline: "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-600 hover:bg-slate-50 ring-slate-200",
            ghost: "hover:bg-slate-100 text-slate-600 hover:text-slate-900 ring-slate-200",
            danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 ring-red-500",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs rounded-lg",
            md: "h-11 px-6 text-sm rounded-xl",
            lg: "h-14 px-8 text-base rounded-2xl",
            icon: "h-10 w-10 rounded-xl",
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        );
    }
);
Button.displayName = "Button";

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
        secondary: "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200",
        outline: "text-slate-600 border-slate-300 hover:bg-slate-50",
        success: "border-transparent bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
        warning: "border-transparent bg-amber-50 text-amber-600 hover:bg-amber-100",
        error: "border-transparent bg-red-50 text-red-600 hover:bg-red-100",
    };

    return (
        <div
            className={cn(
                "inline-flex item-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#4F8CFF] focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}

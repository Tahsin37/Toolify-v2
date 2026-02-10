import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[80px] w-full rounded-md border border-[#2D3748] bg-[#1A1D24] px-3 py-2 text-sm ring-offset-[#0B0D10] placeholder:text-[#6B7280] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[#E5E7EB]",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };

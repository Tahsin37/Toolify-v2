import { cn } from '@/lib/utils';

interface AdSlotProps {
    className?: string;
    format?: 'horizontal' | 'rectangle' | 'vertical';
    label?: string;
}

export function AdSlot({ className, format = 'horizontal', label = 'Advertisement' }: AdSlotProps) {
    const dimensions = {
        horizontal: 'h-[90px] w-full max-w-[728px]',
        rectangle: 'h-[250px] w-[300px]',
        vertical: 'h-[600px] w-[160px]',
    };

    return (
        <div className={cn("flex flex-col items-center justify-center my-8", className)}>
            <div
                className={cn(
                    "bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center relative overflow-hidden",
                    dimensions[format]
                )}
            >
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-medium text-xs uppercase tracking-widest select-none">
                    {label}
                </div>
                {/* Actual AdSense code will be injected here later */}
                <div className="w-full h-full bg-[url('/grid.svg')] opacity-20" />
            </div>
        </div>
    );
}

import * as React from 'react';
import { Card } from '@/components/ui/card';

interface ToolLayoutProps {
    children: React.ReactNode;
    sidebar?: React.ReactNode;
}

export function ToolLayout({ children, sidebar }: ToolLayoutProps) {
    return (
        <div className="container mx-auto px-4 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Tool Area */}
                <div className="lg:col-span-8 space-y-8">
                    {children}
                </div>

                {/* Sidebar (Ads, Related Tools, Info) */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Ad Placeholder */}
                    <Card className="h-64 flex items-center justify-center bg-[#1A1D24] text-[#4A5568] border-dashed">
                        <span className="text-sm font-medium">Advertisement</span>
                    </Card>

                    {sidebar}

                    {/* Another Ad Placeholder */}
                    <Card className="h-96 flex items-center justify-center bg-[#1A1D24] text-[#4A5568] border-dashed">
                        <span className="text-sm font-medium">Sticky Ad</span>
                    </Card>
                </div>
            </div>
        </div>
    );
}

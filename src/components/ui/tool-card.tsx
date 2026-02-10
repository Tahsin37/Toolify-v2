'use client';

import * as React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
    slug: string;
    name: string;
    description: string;
    category: string;
    iconName?: string;
    isPopular?: boolean;
}

export function ToolCard({ slug, name, description, category, iconName = 'Box', isPopular }: ToolCardProps) {
    // Dynamically get icon (fallback to Box)
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.Box;

    // Category Colors (Pastels)
    const categoryColors: Record<string, string> = {
        SEO: "bg-rose-50 text-rose-600",
        Text: "bg-blue-50 text-blue-600",
        Developer: "bg-indigo-50 text-indigo-600",
        Social: "bg-amber-50 text-amber-600",
        Web: "bg-emerald-50 text-emerald-600",
    };

    const iconColorClass = categoryColors[category] || "bg-slate-50 text-slate-600";

    return (
        <Link href={`/tools/${slug}`} className="block h-full">
            <div
                className="group relative h-full bg-white rounded-2xl p-6 border border-slate-100 tool-card-hover flex flex-col"
            >
                {isPopular && (
                    <div className="absolute top-4 right-4">
                        <span className="flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
                        </span>
                    </div>
                )}

                <div className="mb-6">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconColorClass} mb-4 transition-transform group-hover:scale-110 duration-300`}>
                        <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
                        {name}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <Badge variant="secondary" className="bg-slate-50 text-slate-600 font-medium px-2.5 py-1 rounded-md">
                        {category}
                    </Badge>
                    <div className="text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        <ArrowRight className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

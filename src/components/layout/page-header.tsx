'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description: string;
    breadcrumbs?: Array<{ label: string; href: string }>;
    className?: string;
}

export function PageHeader({ title, description, breadcrumbs, className }: PageHeaderProps) {
    return (
        <div className={cn("relative overflow-hidden py-16 md:py-24", className)}>
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[#4F8CFF]/10 blur-3xl" />
                <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#22D3A6]/10 blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto px-4 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    {breadcrumbs && (
                        <motion.nav
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="flex items-center justify-center space-x-2 text-sm text-[#9CA3AF] mb-6"
                        >
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            {breadcrumbs.map((crumb, i) => (
                                <div key={i} className="flex items-center space-x-2">
                                    <ChevronRight className="h-4 w-4" />
                                    <Link
                                        href={crumb.href}
                                        className={cn(
                                            "hover:text-white transition-colors",
                                            i === breadcrumbs.length - 1 && "text-[#4F8CFF] pointer-events-none"
                                        )}
                                    >
                                        {crumb.label}
                                    </Link>
                                </div>
                            ))}
                        </motion.nav>
                    )}

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6"
                    >
                        {title}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-[#9CA3AF] md:text-xl leading-relaxed"
                    >
                        {description}
                    </motion.p>
                </div>
            </div>
        </div>
    );
}

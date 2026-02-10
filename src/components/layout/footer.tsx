'use client';

import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin, ArrowRight } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-12">
            <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column (2 cols wide) */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                                <Zap className="h-4 w-4 fill-current" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">
                                Tool<span className="text-indigo-600">ify</span>
                            </span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                            The professional's choice for SEO and developer utilities.
                            Built for speed, privacy, and precision.
                        </p>
                        <div className="flex space-x-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <a
                                    key={i}
                                    href="#"
                                    className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                                >
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 text-sm">Tools</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/tools?cat=seo" className="hover:text-indigo-600 transition-colors">SEO Audit</Link></li>
                            <li><Link href="/tools?cat=dev" className="hover:text-indigo-600 transition-colors">JSON Formatter</Link></li>
                            <li><Link href="/tools?cat=text" className="hover:text-indigo-600 transition-colors">Word Counter</Link></li>
                            <li><Link href="/tools" className="hover:text-indigo-600 transition-colors">View All</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 text-sm">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                            <li><Link href="/blob" className="hover:text-indigo-600 transition-colors">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-indigo-600 transition-colors">Careers</Link></li>
                            <li><Link href="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 mb-6 text-sm">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link></li>
                            <li><Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link></li>
                            <li><Link href="/security" className="hover:text-indigo-600 transition-colors">Security</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-2 text-sm">Status</h4>
                            <div className="flex items-center space-x-2 text-sm text-slate-600 mb-4">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </span>
                                <span>All systems operational</span>
                            </div>
                            <Link href="/status" className="text-xs font-medium text-indigo-600 hover:underline flex items-center">
                                View uptime <ArrowRight className="h-3 w-3 ml-1" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-slate-400">
                    <p>&copy; {currentYear} Toolify All rights reserved.</p>
                    <div className="flex space-x-6">
                        <Link href="#" className="hover:text-slate-600">Sitemap</Link>
                        <Link href="#" className="hover:text-slate-600">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

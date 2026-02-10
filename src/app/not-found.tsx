import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Home, Search, Wrench } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />

            <main className="flex-1 flex items-center justify-center px-4">
                <div className="text-center max-w-lg">
                    {/* 404 Illustration */}
                    <div className="relative mb-8">
                        <div className="text-[180px] font-black text-slate-100 leading-none select-none">
                            404
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                                <Search className="h-16 w-16 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Message */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                        Page Not Found
                    </h1>
                    <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">
                        Oops! The page you're looking for doesn't exist or has been moved.
                        Let's get you back on track.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <Home className="h-5 w-5 mr-2" />
                            Back to Home
                        </Link>
                        <Link
                            href="/tools"
                            className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-300 hover:border-indigo-500 text-slate-700 hover:text-indigo-600 rounded-lg font-medium transition-colors"
                        >
                            <Wrench className="h-5 w-5 mr-2" />
                            Browse Tools
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <p className="text-sm text-slate-400 mb-4">Popular Tools</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {[
                                { name: 'Word Counter', href: '/tools/word-counter' },
                                { name: 'JSON Formatter', href: '/tools/json-formatter-validator' },
                                { name: 'Meta Title Checker', href: '/tools/meta-title-pixel-checker' },
                                { name: 'Base64 Encoder', href: '/tools/base64-encode-decode' },
                            ].map((tool) => (
                                <Link
                                    key={tool.href}
                                    href={tool.href}
                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                                >
                                    {tool.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/ui/tool-card';
import { getAllTools } from '@/lib/tools';
import { Search, Zap, Shield, Globe, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showResults, setShowResults] = React.useState(false);
    const allTools = getAllTools();

    // Filter tools based on search
    const filteredTools = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return allTools.filter(tool =>
            tool.name.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query) ||
            tool.slug.toLowerCase().includes(query)
        );
    }, [searchQuery, allTools]);

    // Popular tools - featuring most useful everyday tools
    const popularSlugs = [
        'text-to-speech',
        'power-zip-creator',
        'image-compressor',
        'qr-generator',
        'qr-reader',
        'doc-to-pdf'
    ];
    const popularTools = allTools.filter(t => popularSlugs.includes(t.slug));
    const otherTools = allTools.filter(t => !popularSlugs.includes(t.slug));

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative px-4 pt-20 pb-24 md:pt-24 md:pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
                    {/* Background Decor */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-indigo-200/20 rounded-full blur-[100px]" />
                        <div className="absolute top-[30%] right-[20%] w-96 h-96 bg-purple-200/20 rounded-full blur-[100px]" />
                    </div>

                    <div className="container mx-auto relative z-10 text-center max-w-4xl">


                        <div className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 mb-6 md:mb-8 animate-fade-in-up">
                            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2"></span>
                            All-in-One Developer Toolkit
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-4 md:mb-6 leading-[1.1] px-2">
                            The Essential <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Tool Suite</span><br />
                            for Modern Builders.
                        </h1>

                        <p className="text-base sm:text-lg md:text-xl text-slate-500 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
                            {allTools.length}+ Free, privacy-first tools for SEO, development, and content creation.
                            No sign-up required.
                        </p>

                        {/* Search Hero */}
                        <div className="max-w-xl mx-auto relative group px-2">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-20 group-hover:opacity-30 blur transition duration-200"></div>
                            <div className="relative flex items-center bg-white rounded-xl shadow-2xl shadow-indigo-500/10 p-2 border border-slate-100">
                                <Search className="h-5 w-5 sm:h-6 sm:w-6 text-slate-400 ml-3 sm:ml-4 pointer-events-none flex-shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowResults(true);
                                    }}
                                    onFocus={() => setShowResults(true)}
                                    placeholder="Search tools... (e.g., JSON, Image, PDF)"
                                    className="w-full h-10 sm:h-12 px-3 sm:px-4 text-base sm:text-lg outline-none text-slate-700 placeholder:text-slate-400 bg-transparent rounded-lg"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setShowResults(false); }}
                                        className="p-2 hover:bg-slate-100 rounded-lg mr-1 sm:mr-2 flex-shrink-0"
                                    >
                                        <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && searchQuery && (
                                <div className="absolute top-full left-0 right-0 mt-2 mx-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-96 overflow-auto z-50">
                                    {filteredTools.length > 0 ? (
                                        <div className="p-2">
                                            {filteredTools.slice(0, 8).map((tool) => (
                                                <Link
                                                    key={tool.id}
                                                    href={`/tools/${tool.slug}`}
                                                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors"
                                                    onClick={() => setShowResults(false)}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-slate-900 truncate">{tool.name}</p>
                                                        <p className="text-sm text-slate-500 truncate">{tool.category}</p>
                                                    </div>
                                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded ml-2 flex-shrink-0">
                                                        Open →
                                                    </span>
                                                </Link>
                                            ))}
                                            {filteredTools.length > 8 && (
                                                <Link
                                                    href="/tools"
                                                    className="block text-center p-3 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                    onClick={() => setShowResults(false)}
                                                >
                                                    View all {filteredTools.length} results →
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center text-slate-500">
                                            No tools found for "{searchQuery}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Product Hunt & Social Proof */}
                        <div className="mt-12 md:mt-16 animate-fade-in-up delay-200 flex flex-col items-center gap-4">
                            <a href="https://www.producthunt.com/products/toolify-5?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-toolify-6" target="_blank" rel="noopener noreferrer" className="hover:-translate-y-0.5 transition-transform duration-300">
                                <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1077924&theme=light" alt="Toolify - 75+ powerful tools. One platform. Zero friction. | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
                            </a>

                            <p className="text-xs text-slate-400 font-medium tracking-wide">
                                TRUSTED BY <span className="text-slate-600 font-bold">10,000+</span> DEVELOPERS
                            </p>
                        </div>

                        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-slate-500 px-4">
                            <span className="flex items-center"><Zap className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0" /> Instant Results</span>
                            <span className="flex items-center"><Shield className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0" /> Client-Side Secure</span>
                            <span className="flex items-center"><Globe className="h-4 w-4 mr-2 text-indigo-500 flex-shrink-0" /> SEO Optimized</span>
                        </div>
                    </div>
                </section>

                {/* Tools Grid */}
                <section className="py-16 md:py-20 lg:py-24 bg-white border-t border-slate-100">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 md:mb-12 gap-4">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3">Popular Utilities</h2>
                                <p className="text-slate-500 text-base md:text-lg">Most used tools by the community this week.</p>
                            </div>
                            <Link href="/tools">
                                <Button variant="ghost" className="hidden sm:inline-flex text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-full">
                                    View All Tools
                                </Button>
                            </Link>
                        </div>

                        {/* Popular Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-16 md:mb-20">
                            {popularTools.map((tool) => (
                                <ToolCard
                                    key={tool.id}
                                    slug={tool.slug}
                                    name={tool.name}
                                    description={`Professional ${tool.name} tool for free online use.`}
                                    category={tool.category}
                                    isPopular={true}
                                    iconName={
                                        tool.slug.includes('json') ? 'FileJson' :
                                            tool.slug.includes('word') ? 'Type' :
                                                tool.slug.includes('seo') ? 'Search' :
                                                    tool.slug.includes('png') ? 'Image' :
                                                        tool.slug.includes('csv') ? 'FileSpreadsheet' :
                                                            undefined
                                    }
                                />
                            ))}
                        </div>

                        <div className="mb-8 md:mb-12">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 md:mb-3">All Tools</h2>
                            <p className="text-slate-500 text-base md:text-lg">Explore our complete collection.</p>
                        </div>

                        {/* All Tools Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {otherTools.slice(0, 16).map((tool) => (
                                <ToolCard
                                    key={tool.id}
                                    slug={tool.slug}
                                    name={tool.name}
                                    description={`Optimized ${tool.name} utility.`}
                                    category={tool.category}
                                />
                            ))}
                        </div>

                        <div className="mt-12 md:mt-16 text-center">
                            <Link href="/tools">
                                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 md:px-10 h-12 md:h-14 text-sm md:text-base border-2">
                                    Load More Tools
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 md:py-28 lg:py-32 bg-slate-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 px-4">Built for speed. Designed for you.</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto mb-8 md:mb-10 text-base md:text-lg px-4">
                            Stop fighting with clunky, ad-filled tools. Switch to Toolify and experience the difference.
                        </p>
                        <Link href="/tools">
                            <Button size="lg" className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-400 text-white rounded-full px-10 md:px-12 h-12 md:h-14 text-base md:text-lg shadow-xl shadow-indigo-900/50 mx-4">
                                Explore All Tools
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

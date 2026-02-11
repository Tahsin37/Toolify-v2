'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, X, Command, Zap, Search, Heart, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllTools } from '@/lib/tools';

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [showSearchResults, setShowSearchResults] = React.useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const searchRef = React.useRef<HTMLDivElement>(null);
    const allTools = getAllTools();

    // Handle scroll effect for navbar
    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle Ctrl+K shortcut
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('navbar-search');
                searchInput?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close search results when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter tools based on search
    const filteredTools = React.useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return allTools.filter(tool =>
            tool.name.toLowerCase().includes(query) ||
            tool.category.toLowerCase().includes(query) ||
            tool.slug.toLowerCase().includes(query)
        ).slice(0, 6);
    }, [searchQuery, allTools]);

    const handleToolClick = (slug: string) => {
        router.push(`/tools/${slug}`);
        setShowSearchResults(false);
        setSearchQuery('');
    };

    const navItems = [
        { name: 'Tools', href: '/tools' },
        { name: 'Developers', href: '/tools?category=Developer' },
        { name: 'SEO', href: '/tools?category=SEO' },
    ];

    return (
        <header
            className={cn(
                "glass-nav w-full",
                isScrolled ? "shadow-sm" : ""
            )}
        >
            <div className="container mx-auto px-4 lg:px-8 h-16 md:h-20 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2 group">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform duration-300">
                        <Zap className="h-5 w-5 fill-current" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                        Tool<span className="text-indigo-600">ify</span>
                    </span>
                </Link>

                {/* Desktop Search Bar (Centered) */}
                <div className="hidden md:flex flex-1 max-w-md mx-8 relative group" ref={searchRef}>
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        id="navbar-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchResults(true);
                        }}
                        onFocus={() => setShowSearchResults(true)}
                        placeholder="Search tools..."
                        className="w-full bg-slate-50 border border-slate-200 text-sm rounded-full py-2.5 pl-10 pr-16 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm group-hover:shadow-md"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-[10px] font-medium text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">Ctrl K</span>
                    </div>

                    {/* Search Results Dropdown */}
                    <AnimatePresence>
                        {showSearchResults && searchQuery && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 max-h-80 overflow-auto z-50"
                            >
                                {filteredTools.length > 0 ? (
                                    <div className="p-2">
                                        {filteredTools.map((tool) => (
                                            <button
                                                key={tool.id}
                                                onClick={() => handleToolClick(tool.slug)}
                                                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900">{tool.name}</p>
                                                    <p className="text-sm text-slate-500">{tool.category}</p>
                                                </div>
                                                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">
                                                    Open →
                                                </span>
                                            </button>
                                        ))}
                                        {allTools.filter(tool =>
                                            tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            tool.category.toLowerCase().includes(searchQuery.toLowerCase())
                                        ).length > 6 && (
                                                <Link
                                                    href={`/tools?q=${encodeURIComponent(searchQuery)}`}
                                                    className="block text-center p-3 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium"
                                                    onClick={() => setShowSearchResults(false)}
                                                >
                                                    View all results →
                                                </Link>
                                            )}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-slate-500">
                                        No tools found for "{searchQuery}"
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "text-[13px] font-medium px-4 py-2 rounded-full transition-all duration-200",
                                pathname === item.href
                                    ? "text-indigo-600 bg-indigo-50"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}
                    <div className="w-px h-6 bg-slate-200 mx-2" />

                    {/* GitHub Button */}
                    <Link href="https://github.com/Tahsin37/Toolify-v2" target="_blank" className="hidden lg:flex items-center justify-center h-10 w-10 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all">
                        <Github className="h-5 w-5" />
                    </Link>

                    {/* Donation Button with Animation */}
                    <Link href="/donate">
                        <motion.button
                            className="relative group inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold overflow-hidden"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Animated gradient background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500"
                                animate={{
                                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'linear',
                                }}
                                style={{ backgroundSize: '200% 200%' }}
                            />
                            {/* Glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                            {/* Content */}
                            <span className="relative flex items-center gap-2 text-white">
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <Heart className="h-4 w-4 fill-current" />
                                </motion.span>
                                Buy Me Coffee
                            </span>
                        </motion.button>
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-200 bg-white px-4 py-4 shadow-xl"
                    >
                        <div className="flex flex-col space-y-2">
                            {/* Mobile Search */}
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search tools..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Mobile Search Results */}
                            {searchQuery && filteredTools.length > 0 && (
                                <div className="bg-slate-50 rounded-lg p-2 mb-2">
                                    {filteredTools.map((tool) => (
                                        <button
                                            key={tool.id}
                                            onClick={() => {
                                                handleToolClick(tool.slug);
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full text-left p-2 hover:bg-white rounded-lg text-sm"
                                        >
                                            <span className="font-medium">{tool.name}</span>
                                            <span className="text-slate-500 ml-2">• {tool.category}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                                <Link href="https://github.com/Tahsin37/Toolify-v2" target="_blank" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button variant="outline" className="w-full justify-center rounded-xl h-11 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                                        <Github className="h-4 w-4 mr-2" />
                                        Star on GitHub
                                    </Button>
                                </Link>
                                <Link href="/donate" onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button className="w-full justify-center rounded-xl h-11 bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600">
                                        <Heart className="h-4 w-4 mr-2 fill-current" />
                                        Buy Me Coffee
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

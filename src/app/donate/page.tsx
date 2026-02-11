'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Heart, Copy, CheckCircle2, ExternalLink, Coffee,
    Zap, Gift, Star, Sparkles, Lock
} from 'lucide-react';

interface CryptoWallet {
    name: string;
    symbol: string;
    address: string;
    color: string;
    icon: string;
}

const cryptoWallets: CryptoWallet[] = [
    {
        name: 'Bitcoin',
        symbol: 'BTC',
        address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
        color: 'from-orange-400 to-amber-500',
        icon: '₿',
    },
    {
        name: 'Ethereum',
        symbol: 'ETH',
        address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        color: 'from-indigo-400 to-purple-500',
        icon: 'Ξ',
    },
    {
        name: 'USDT (TRC-20)',
        symbol: 'USDT',
        address: 'TN9RRaXkCFtTXRso2GdTZxSxxwufzxLQPa',
        color: 'from-emerald-400 to-teal-500',
        icon: '₮',
    },
];

export default function DonatePage() {
    const [copiedAddress, setCopiedAddress] = React.useState<string | null>(null);

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedAddress(id);
        setTimeout(() => setCopiedAddress(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-16 lg:px-8">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl mb-6 shadow-lg shadow-pink-500/25 animate-pulse">
                        <Heart className="h-10 w-10 text-white fill-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Support Toolify
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Toolify is free for everyone. Your donations help us keep the servers running,
                        develop new tools, and maintain our commitment to privacy-first software.
                    </p>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { value: '50+', label: 'Free Tools', icon: Zap },
                        { value: '100%', label: 'Privacy First', icon: Star },
                        { value: '0', label: 'Data Collected', icon: Gift },
                        { value: '∞', label: 'Files Processed', icon: Sparkles },
                    ].map((stat, index) => (
                        <Card key={index} className="p-4 bg-white border border-slate-200 text-center">
                            <stat.icon className="h-5 w-5 text-indigo-500 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-sm text-slate-500">{stat.label}</p>
                        </Card>
                    ))}
                </div>

                {/* Buy Me a Coffee — Primary CTA */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        <span className="inline-flex items-center gap-2">
                            <Coffee className="h-6 w-6 text-amber-500" />
                            Buy Me a Coffee
                        </span>
                    </h2>
                    <div className="max-w-lg mx-auto">
                        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border border-amber-200 p-8 text-center hover:shadow-xl transition-all duration-300 group">
                            {/* Decorative circles */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-200/30 rounded-full blur-xl" />
                            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-orange-200/30 rounded-full blur-xl" />

                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mb-5 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
                                    <Coffee className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">
                                    Support with a Coffee ☕
                                </h3>
                                <p className="text-slate-600 mb-6 text-sm max-w-sm mx-auto">
                                    Your support keeps Toolify free and ad-free. Every coffee counts!
                                </p>
                                <a
                                    href="https://buymeacoffee.com/tahsin37"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block"
                                >
                                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-base font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105">
                                        <Coffee className="h-5 w-5 mr-2" />
                                        Buy Me a Coffee
                                        <ExternalLink className="h-4 w-4 ml-2 opacity-60" />
                                    </Button>
                                </a>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Crypto Donations — Currently Inactive */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
                        <span className="inline-flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-indigo-500" />
                            Donate with Crypto
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {cryptoWallets.map((wallet) => (
                            <Card key={wallet.symbol} className="relative p-6 bg-white border border-slate-200 overflow-hidden">
                                {/* Inactive Overlay */}
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center">
                                    <div className="bg-slate-100 rounded-full p-3 mb-3">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-500">Not Active Currently</p>
                                    <p className="text-xs text-slate-400 mt-1">Coming soon</p>
                                </div>

                                {/* Card content (dimmed behind overlay) */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${wallet.color} flex items-center justify-center text-2xl font-bold text-white shadow-sm`}>
                                        {wallet.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{wallet.name}</h3>
                                        <p className="text-sm text-slate-500">{wallet.symbol}</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-100 rounded-lg mb-3">
                                    <p className="font-mono text-xs text-slate-700 break-all leading-relaxed">
                                        {wallet.address}
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    disabled
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Address
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Thank You */}
                <Card className="p-8 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
                        <Heart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Thank You!</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                        Every donation, no matter the size, helps us continue developing free,
                        privacy-focused tools for everyone. We truly appreciate your support!
                    </p>
                </Card>

                {/* Alternative Ways */}
                <div className="text-center">
                    <p className="text-slate-500 mb-4">Other ways to support us:</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <a
                            href="https://twitter.com/intent/tweet?text=Check%20out%20Toolify%20-%20free%20online%20tools%20for%20SEO%2C%20converters%2C%20and%20more!&url=https://toolify.app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Share on Twitter
                            </Button>
                        </a>
                        <a
                            href="https://github.com/Tahsin37/Toolify-v2"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="gap-2">
                                <Star className="h-4 w-4" />
                                Star on GitHub
                            </Button>
                        </a>
                        <a
                            href="https://www.producthunt.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button variant="outline" size="sm" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                Write a Review
                            </Button>
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

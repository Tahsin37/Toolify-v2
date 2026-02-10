'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import {
    Shield, Lock, Server, Eye, CheckCircle2, Globe, Cpu,
    FileX, Database, Fingerprint, Zap, ArrowRight
} from 'lucide-react';

const securityFeatures = [
    {
        icon: Cpu,
        title: '100% Browser-Based',
        description: 'All tools run entirely in your browser using modern Web APIs. No server processing required.',
        color: 'bg-indigo-100 text-indigo-600',
    },
    {
        icon: FileX,
        title: 'No File Uploads',
        description: 'Your files never leave your device. We don\'t upload, store, or transmit your data anywhere.',
        color: 'bg-emerald-100 text-emerald-600',
    },
    {
        icon: Database,
        title: 'Zero Data Storage',
        description: 'We don\'t have databases storing your content. When you close the tab, everything is gone.',
        color: 'bg-violet-100 text-violet-600',
    },
    {
        icon: Eye,
        title: 'No Tracking',
        description: 'We don\'t use invasive tracking. Your usage is completely private and anonymous.',
        color: 'bg-amber-100 text-amber-600',
    },
    {
        icon: Lock,
        title: 'Encrypted Connection',
        description: 'All connections use HTTPS encryption. Your browsing is protected end-to-end.',
        color: 'bg-pink-100 text-pink-600',
    },
    {
        icon: Fingerprint,
        title: 'No Account Required',
        description: 'Use all tools without registration. No personal information needed.',
        color: 'bg-cyan-100 text-cyan-600',
    },
];

const trustBadges = [
    { label: 'SSL Secured', icon: Lock },
    { label: 'GDPR Compliant', icon: Shield },
    { label: 'No Data Collection', icon: Database },
    { label: 'Privacy First', icon: Eye },
];

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col">
            <Header />

            <main className="flex-1 container mx-auto px-4 py-16 lg:px-8">
                {/* Hero */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl mb-6 shadow-lg shadow-emerald-500/25">
                        <Shield className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Your Security is Our Priority
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Toolify is designed with privacy and security at its core. All our tools
                        run 100% in your browser – your files never touch our servers.
                    </p>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {trustBadges.map((badge, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm"
                        >
                            <badge.icon className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm font-medium text-slate-700">{badge.label}</span>
                        </div>
                    ))}
                </div>

                {/* Main Security Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {securityFeatures.map((feature, index) => (
                        <Card key={index} className="p-6 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200">
                            <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                            <p className="text-slate-600">{feature.description}</p>
                        </Card>
                    ))}
                </div>

                {/* How It Works */}
                <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white mb-16 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-full blur-3xl" />
                    <div className="relative">
                        <h2 className="text-2xl font-bold mb-6">How Our Security Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { step: 1, title: 'You Open a Tool', desc: 'The tool loads in your browser' },
                                { step: 2, title: 'Add Your Files', desc: 'Files stay on your device' },
                                { step: 3, title: 'Processing Happens', desc: 'All work done locally' },
                                { step: 4, title: 'Download Result', desc: 'Direct to your device' },
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-lg font-bold mb-3">
                                        {item.step}
                                    </div>
                                    <h4 className="font-semibold mb-1">{item.title}</h4>
                                    <p className="text-sm text-slate-300">{item.desc}</p>
                                    {i < 3 && (
                                        <ArrowRight className="hidden md:block absolute top-3 -right-3 h-5 w-5 text-indigo-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Comparison */}
                <Card className="p-8 bg-white border border-slate-200 mb-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Toolify vs Traditional Tools</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Feature</th>
                                    <th className="text-center py-3 px-4 font-semibold text-emerald-700">Toolify</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-500">Others</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {[
                                    ['File Processing', 'Browser-only', 'Server upload'],
                                    ['Data Storage', 'None', 'May store files'],
                                    ['Account Required', 'No', 'Usually yes'],
                                    ['Speed', 'Instant', 'Upload/download delays'],
                                    ['Privacy', 'Complete', 'Varies'],
                                    ['Works Offline', 'Yes (cached)', 'No'],
                                ].map(([feature, toolify, others], i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="py-3 px-4 text-slate-700">{feature}</td>
                                        <td className="py-3 px-4 text-center">
                                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full text-xs font-medium">
                                                <CheckCircle2 className="h-3 w-3" /> {toolify}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center text-slate-500">{others}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Final CTA */}
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-800 rounded-full text-lg font-semibold">
                        <Shield className="h-5 w-5" />
                        Your data never leaves your browser
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

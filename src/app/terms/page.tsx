import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, Home, FileText } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - ZyloTools | Usage Guidelines',
    description: 'Read the terms and conditions for using ZyloTools. Our free online tools are provided as-is for developers and SEO professionals.',
};

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Terms of Service
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Please read these terms carefully before using our services.
                        </p>
                    </div>
                </section>

                {/* Breadcrumb */}
                <div className="container mx-auto px-4 py-6">
                    <nav className="flex items-center text-sm text-slate-500">
                        <Link href="/" className="hover:text-indigo-600 flex items-center">
                            <Home className="h-4 w-4 mr-1" /> Home
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="text-slate-900 font-medium">Terms of Service</span>
                    </nav>
                </div>

                {/* Content */}
                <section className="container mx-auto px-4 pb-20">
                    <Card className="p-8 lg:p-12 bg-white border border-slate-200 shadow-sm max-w-4xl mx-auto">
                        <div className="prose prose-slate prose-lg max-w-none">
                            <p className="text-slate-500 text-sm mb-8">Last updated: February 2026</p>

                            <h2>1. Acceptance of Terms</h2>
                            <p>
                                By accessing and using ZyloTools, you accept and agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our services.
                            </p>

                            <h2>2. Description of Service</h2>
                            <p>
                                ZyloTools provides free online tools for SEO professionals, developers, and content creators.
                                Our tools include text analyzers, code formatters, social media utilities, and more.
                            </p>

                            <h2>3. User Responsibilities</h2>
                            <p>You agree to:</p>
                            <ul>
                                <li>Use our tools responsibly and for lawful purposes only</li>
                                <li>Not attempt to reverse engineer or exploit our services</li>
                                <li>Not use automated scripts to access our tools without permission</li>
                                <li>Not use our tools to process illegal or harmful content</li>
                            </ul>

                            <h2>4. Intellectual Property</h2>
                            <p>
                                All content, design, and code on ZyloTools are protected by copyright.
                                You may not reproduce, distribute, or create derivative works without our permission.
                            </p>

                            <h2>5. Disclaimer of Warranties</h2>
                            <p>
                                Our tools are provided <strong>"as is"</strong> without warranty of any kind.
                                We do not guarantee the accuracy, completeness, or reliability of any results.
                                Use our tools at your own risk.
                            </p>

                            <h2>6. Limitation of Liability</h2>
                            <p>
                                ZyloTools shall not be liable for any direct, indirect, incidental, or consequential damages
                                arising from your use of our services.
                            </p>

                            <h2>7. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these terms at any time. Continued use of our services
                                constitutes acceptance of any changes.
                            </p>

                            <h2>8. Contact</h2>
                            <p>
                                For questions about these Terms, please <Link href="/contact" className="text-indigo-600 hover:underline">contact us</Link>.
                            </p>
                        </div>
                    </Card>
                </section>
            </main>

            <Footer />
        </div>
    );
}

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, Home, Shield } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - ZyloTools | How We Protect Your Data',
    description: 'Learn how ZyloTools protects your privacy. Our tools run client-side, meaning your data never leaves your device.',
};

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Privacy Policy
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            We value your privacy. Learn how we handle your data.
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
                        <span className="text-slate-900 font-medium">Privacy Policy</span>
                    </nav>
                </div>

                {/* Content */}
                <section className="container mx-auto px-4 pb-20">
                    <Card className="p-8 lg:p-12 bg-white border border-slate-200 shadow-sm max-w-4xl mx-auto">
                        <div className="prose prose-slate prose-lg max-w-none">
                            <p className="text-slate-500 text-sm mb-8">Last updated: February 2026</p>

                            <h2>1. Data Collection</h2>
                            <p>
                                We prioritize your privacy. <strong>Most of our tools run entirely in your browser (client-side)</strong>,
                                meaning your data never leaves your device. We do not store, collect, or transmit any content
                                you process using our tools.
                            </p>

                            <h2>2. Cookies</h2>
                            <p>
                                We use cookies to improve your experience and analyze traffic. These cookies help us understand
                                how visitors use our site. You can control cookie settings in your browser at any time.
                            </p>

                            <h2>3. Third-Party Services</h2>
                            <p>
                                We use Google Analytics to understand site usage and Google AdSense to display relevant advertisements.
                                These services may collect data as per their respective privacy policies:
                            </p>
                            <ul>
                                <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
                            </ul>

                            <h2>4. Data Security</h2>
                            <p>
                                Since our tools process data locally in your browser, there is no server-side storage of your content.
                                Your data remains on your device and is cleared when you close the browser tab.
                            </p>

                            <h2>5. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please <Link href="/contact" className="text-indigo-600 hover:underline">contact us</Link>.
                            </p>
                        </div>
                    </Card>
                </section>
            </main>

            <Footer />
        </div>
    );
}

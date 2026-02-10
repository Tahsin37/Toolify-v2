'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MapPin, Send, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
    const [submitted, setSubmitted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate submission
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6">
                            <MessageCircle className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Contact Us
                        </h1>
                        <p className="text-lg text-white/80 max-w-2xl mx-auto">
                            Have questions, suggestions, or feedback? We'd love to hear from you.
                        </p>
                    </div>
                </section>

                <section className="container mx-auto px-4 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
                        {/* Contact Form */}
                        <Card className="p-8 bg-white border border-slate-200 shadow-lg">
                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6">
                                        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                                    <p className="text-slate-500 mb-6">
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                    <Button onClick={() => setSubmitted(false)} variant="outline">
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Send us a message</h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Name *</label>
                                                <Input
                                                    placeholder="John Doe"
                                                    required
                                                    className="bg-slate-50 border-slate-200 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700">Email *</label>
                                                <Input
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    required
                                                    className="bg-slate-50 border-slate-200 focus:border-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Subject *</label>
                                            <Input
                                                placeholder="Tool suggestion, bug report, partnership..."
                                                required
                                                className="bg-slate-50 border-slate-200 focus:border-indigo-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Message *</label>
                                            <Textarea
                                                placeholder="Tell us how we can help you..."
                                                required
                                                className="min-h-[150px] bg-slate-50 border-slate-200 focus:border-indigo-500 resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="flex items-center">
                                                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                                                    Sending...
                                                </span>
                                            ) : (
                                                <>
                                                    <Send className="h-4 w-4 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </>
                            )}
                        </Card>

                        {/* Contact Info */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">Get in Touch</h2>
                                <p className="text-slate-500 mb-8">
                                    We're here to help and answer any questions you might have.
                                    We look forward to hearing from you!
                                </p>
                            </div>

                            {/* Contact Cards */}
                            <div className="space-y-4">
                                <Card className="p-5 bg-white border border-slate-200 flex items-start space-x-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Email Us</h3>
                                        <p className="text-slate-500 text-sm mb-1">For general inquiries</p>
                                        <a href="mailto:support@zylotools.com" className="text-indigo-600 hover:underline font-medium">
                                            support@zylotools.com
                                        </a>
                                    </div>
                                </Card>

                                <Card className="p-5 bg-white border border-slate-200 flex items-start space-x-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                        <Clock className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Response Time</h3>
                                        <p className="text-slate-500 text-sm mb-1">We typically respond within</p>
                                        <span className="text-emerald-600 font-medium">24 hours</span>
                                    </div>
                                </Card>

                                <Card className="p-5 bg-white border border-slate-200 flex items-start space-x-4 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">Location</h3>
                                        <p className="text-slate-500 text-sm">
                                            We operate globally with a distributed team.<br />
                                            100% remote company.
                                        </p>
                                    </div>
                                </Card>
                            </div>

                            {/* FAQ Link */}
                            <Card className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 border-0 text-white">
                                <h3 className="font-bold text-lg mb-2">Looking for quick answers?</h3>
                                <p className="text-white/80 text-sm mb-4">
                                    Check out our tools - most questions are answered in the FAQ sections on each tool page.
                                </p>
                                <Link href="/tools" className="inline-flex items-center justify-center px-4 py-2 bg-white/10 border border-white/30 text-white hover:bg-white/20 rounded-lg font-medium transition-colors">
                                    Browse All Tools
                                </Link>
                            </Card>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card } from '@/components/ui/card';
import {
    Users, Target, ShieldCheck, Zap, Globe, Heart,
    Code2, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'About Us - Toolify',
    description: 'Learn about Toolify - the free, privacy-first online tools platform. Built by developers, for everyone.',
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
                    <div className="container px-4 text-center mx-auto max-w-5xl">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl mb-6 shadow-xl shadow-indigo-500/20">
                            <Sparkles className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                            About Toolify
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Free, fast, and privacy-focused online tools built for developers,
                            marketers, and everyone who wants to be more productive.
                        </p>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-12 bg-white border-y border-slate-100">
                    <div className="container px-4 mx-auto max-w-5xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: '50+', label: 'Free Tools' },
                                { value: '100%', label: 'Privacy First' },
                                { value: '0', label: 'Ads or Trackers' },
                                { value: '∞', label: 'Files Processed' },
                            ].map((stat, i) => (
                                <div key={i}>
                                    <p className="text-4xl font-bold text-indigo-600 mb-1">{stat.value}</p>
                                    <p className="text-slate-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Cards */}
                <section className="py-20 bg-white">
                    <div className="container px-4 mx-auto max-w-5xl">
                        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
                            What We Stand For
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Target,
                                    title: "Our Mission",
                                    desc: "Provide free, high-quality tools that help developers and marketers work faster and more efficiently.",
                                    color: "bg-blue-500"
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Privacy First",
                                    desc: "Your data belongs to you. Most of our tools run entirely in your browser - nothing is ever uploaded.",
                                    color: "bg-emerald-500"
                                },
                                {
                                    icon: Users,
                                    title: "Community Driven",
                                    desc: "We listen to our users. Have a tool request? Let us know and we'll build it.",
                                    color: "bg-violet-500"
                                }
                            ].map((item, i) => (
                                <Card key={i} className="p-8 bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all">
                                    <div className={`h-14 w-14 rounded-2xl ${item.color} flex items-center justify-center text-white mb-6 shadow-lg`}>
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-20 bg-slate-50">
                    <div className="container px-4 mx-auto max-w-5xl">
                        <div className="max-w-4xl mx-auto">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 mb-6">Who We Are</h2>
                                    <p className="text-lg text-slate-600 leading-relaxed mb-4">
                                        Toolify was founded by a team of passionate developers who were tired of
                                        ad-riddled, slow, and unreliable online tools.
                                    </p>
                                    <p className="text-lg text-slate-600 leading-relaxed">
                                        We set out to build a better alternative: a suite of tools that are
                                        fast, modern, and completely free to use - without compromising your privacy.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { icon: Zap, text: 'Lightning-fast performance' },
                                        { icon: Globe, text: 'Works offline (most tools)' },
                                        { icon: Code2, text: 'Built with modern tech' },
                                        { icon: Heart, text: 'Made with love' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <item.icon className="h-5 w-5" />
                                            </div>
                                            <span className="font-medium text-slate-700">{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technology */}
                <section className="py-20 bg-white">
                    <div className="container px-4 mx-auto max-w-5xl">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Technology</h2>
                            <p className="text-lg text-slate-600 leading-relaxed mb-8">
                                Built on cutting-edge web technology, our platform uses Next.js 14,
                                TypeScript, and WebAssembly where needed. This ensures our tools are
                                not only accurate but incredibly fast.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {['Next.js 14', 'TypeScript', 'React', 'Tailwind CSS', 'WebAssembly', 'Three.js'].map(tech => (
                                    <span key={tech} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 bg-gradient-to-br from-indigo-600 to-violet-600">
                    <div className="container px-4 text-center mx-auto max-w-5xl">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to Get Started?
                        </h2>
                        <p className="text-indigo-100 mb-8 max-w-xl mx-auto">
                            Explore our collection of 50+ free tools and boost your productivity today.
                        </p>
                        <Link
                            href="/tools"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                        >
                            Browse All Tools
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

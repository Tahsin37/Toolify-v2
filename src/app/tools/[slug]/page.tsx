import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AdSlot } from '@/components/ui/ad-slot';
import { ToolRenderer } from '@/components/tools/tool-renderer';
import { getToolBySlug, getAllTools } from '@/lib/tools';
import { getToolSEO, generateToolSchema, generateFAQSchema } from '@/lib/seo/tool-metadata';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { ChevronRight, Home, Share2, Flag, ThumbsUp, CheckCircle } from 'lucide-react';
import { ToolActions } from '@/components/ui/tool-actions';

// Generate static params for all tools at build time
export async function generateStaticParams() {
    const tools = getAllTools();
    return tools.map((tool) => ({
        slug: tool.slug,
    }));
}

// Generate comprehensive metadata for each tool
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const tool = getToolBySlug(params.slug);
    if (!tool) return {};

    const seo = getToolSEO(params.slug);
    const title = seo?.title || `${tool.name} - Free Online Tool | Toolify`;
    const description = seo?.description || `Use our free ${tool.name} to optimize your workflow. Fast, secure, and easy to use online tool.`;
    const keywords = seo?.keywords || [];

    return {
        title,
        description,
        keywords: keywords.join(', '),
        openGraph: {
            title,
            description,
            url: `/tools/${params.slug}`,
            siteName: 'Toolify',
            type: 'website',
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: tool.name,
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.png'],
        },
        alternates: {
            canonical: `/tools/${params.slug}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    };
}

export default function ToolPage({ params }: { params: { slug: string } }) {
    const tool = getToolBySlug(params.slug);

    if (!tool) {
        notFound();
    }

    const seo = getToolSEO(params.slug);
    const allTools = getAllTools();
    const relatedTools = allTools.filter(t => t.category === tool.category && t.id !== tool.id).slice(0, 5);

    // Generate structured data
    const toolSchema = generateToolSchema(params.slug, 'https://toolify.app');
    const faqSchema = generateFAQSchema(params.slug);

    return (
        <>
            {/* JSON-LD Structured Data */}
            <Script
                id="tool-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
            />
            {faqSchema && (
                <Script
                    id="faq-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}

            <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
                <Header />

                <main className="flex-1 container mx-auto px-4 lg:px-8 py-8 md:py-12">
                    {/* Clean Breadcrumb */}
                    <nav className="flex items-center text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
                        <Link href="/" className="hover:text-indigo-600 transition-colors flex items-center">
                            <Home className="h-4 w-4 mr-2" />
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
                        <Link href="/tools" className="hover:text-indigo-600 transition-colors">
                            Tools
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
                        <Link href={`/tools?category=${tool.category}`} className="hover:text-indigo-600 transition-colors">
                            {tool.category}
                        </Link>
                        <ChevronRight className="h-4 w-4 mx-2 text-slate-300" />
                        <span className="text-slate-900 font-medium truncate">{tool.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                        {/* Left Sidebar (Desktop) */}
                        <aside className="hidden lg:block lg:col-span-3 space-y-8">
                            {/* Quick Access Menu */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sticky top-24">
                                <h3 className="font-bold text-slate-900 mb-4 px-2 text-sm uppercase tracking-wider">
                                    {tool.category} Tools
                                </h3>
                                <ul className="space-y-1">
                                    {relatedTools.map(t => (
                                        <li key={t.id}>
                                            <Link
                                                href={`/tools/${t.slug}`}
                                                className="block px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors truncate"
                                            >
                                                {t.name}
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link
                                            href={`/tools?category=${tool.category}`}
                                            className="block px-3 py-2 mt-2 text-sm font-medium text-indigo-600 hover:underline"
                                        >
                                            View all {tool.category} tools &rarr;
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Sidebar Ad */}
                            <AdSlot format="rectangle" label="Ad Space" className="sticky top-[400px]" />
                        </aside>

                        {/* Main Content */}
                        <div className="lg:col-span-9 space-y-8">
                            {/* Tool Header with SEO Optimized Content */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                                    {seo?.h1 || tool.name}
                                </h1>
                                <p className="text-lg text-slate-500 max-w-3xl leading-relaxed">
                                    {seo?.h2 || `Professional grade ${tool.name.toLowerCase()}. Secure, fast, and runs entirely in your browser.`}
                                </p>
                            </div>

                            {/* Leaderboard Ad */}
                            <AdSlot format="horizontal" />

                            {/* The Workspace (Tool Card) */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 min-h-[500px] relative overflow-hidden">
                                <div className="relative z-10">
                                    <ToolRenderer slug={params.slug} />
                                </div>
                            </div>

                            {/* Action Bar / Feedback */}
                            <ToolActions toolName={tool.name} toolSlug={params.slug} />

                            {/* SEO Content / Article with Dynamic FAQ */}
                            <article className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-indigo bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                                <h2>About This Tool</h2>
                                <p>
                                    The {tool.name} is a powerful utility designed for developers, SEO professionals, and content creators.
                                    Unlike other tools that send your data to a server, this tool processes everything
                                    locally in your browser, ensuring maximum privacy and speed.
                                </p>

                                <h3>Key Features</h3>
                                <ul>
                                    <li><strong>100% Free:</strong> No signup, no limits, no hidden costs.</li>
                                    <li><strong>Privacy Focused:</strong> No data leaves your device. All processing is client-side.</li>
                                    <li><strong>Instant Results:</strong> No loading times or server delays.</li>
                                    <li><strong>Professional Quality:</strong> Built for real-world production use.</li>
                                </ul>

                                <h3>How to Use</h3>
                                <ol>
                                    <li>Enter or paste your content into the input field above.</li>
                                    <li>Adjust any settings or configuration options if available.</li>
                                    <li>Click the primary action button to process your data.</li>
                                    <li>Copy the results to your clipboard or use them directly.</li>
                                </ol>

                                {/* Dynamic FAQ from SEO metadata */}
                                {seo?.faq && seo.faq.length > 0 && (
                                    <>
                                        <h3>Frequently Asked Questions</h3>
                                        {seo.faq.map((item, index) => (
                                            <details key={index} className="mb-4">
                                                <summary className="font-semibold cursor-pointer py-2 flex items-center">
                                                    <CheckCircle className="h-5 w-5 text-emerald-500 mr-2 inline" />
                                                    {item.question}
                                                </summary>
                                                <p className="mt-2 text-slate-600 pl-7">{item.answer}</p>
                                            </details>
                                        ))}
                                    </>
                                )}
                            </article>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}

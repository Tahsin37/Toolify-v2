'use client';

import * as React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ToolCard } from '@/components/ui/tool-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getAllTools, TOOL_REGISTRY } from '@/lib/tools';
import { Search, X, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ToolsPage() {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    const allTools = getAllTools();
    const categories = Object.values(TOOL_REGISTRY).map(c => c.category);

    // Rich, SEO-optimized tool descriptions
    const toolDescriptions: Record<string, string> = {
        'meta-title-pixel-checker': 'Analyze your meta title pixel width to ensure it displays perfectly in Google search results without truncation.',
        'meta-description-pixel-checker': 'Check your meta description length and pixel width for optimal SERP display and higher click-through rates.',
        'robots-txt-validator': 'Validate your robots.txt file syntax, detect errors, and ensure search engine crawlers can index your site properly.',
        'xml-sitemap-url-counter': 'Count and analyze URLs in your XML sitemap to verify all important pages are included for crawling.',
        'canonical-url-checker': 'Verify canonical URLs are properly set to prevent duplicate content issues and consolidate SEO ranking signals.',
        'heading-structure-analyzer': 'Analyze H1-H6 heading hierarchy for proper SEO structure, accessibility compliance, and content organization.',
        'keyword-density-checker': 'Calculate keyword density and frequency to optimize content without keyword stuffing for better rankings.',
        'seo-slug-optimizer': 'Generate clean, SEO-friendly URL slugs from any text with customizable length and separator options.',
        'serp-preview-tool': 'Preview how your page appears in Google search results with real-time title and description rendering.',
        'noindex-nofollow-checker': 'Detect noindex, nofollow, and other meta robot directives that may prevent search engine indexing.',
        'website-analyzer': 'Comprehensive website analysis with security headers, performance metrics, SEO scoring, and technology detection.',
        'website-safety-checker': 'Check website safety, SSL status, and security headers to identify potential security vulnerabilities.',
        'seo-checker': 'Get a complete SEO audit score with actionable recommendations to improve your search engine rankings.',
        'word-counter': 'Count words, characters, sentences, and paragraphs with reading time estimates for any text content.',
        'character-counter': 'Precise character counting with and without spaces, perfect for social media posts and form field limits.',
        'case-converter': 'Convert text between uppercase, lowercase, title case, sentence case, and more formatting options instantly.',
        'remove-duplicate-lines': 'Remove duplicate lines and find unique entries in your text with one click. Clean data effortlessly.',
        'text-diff-checker': 'Compare two texts side-by-side with highlighted differences. Perfect for code reviews and document comparison.',
        'whitespace-cleaner': 'Remove extra spaces, tabs, and line breaks from text. Clean and normalize whitespace instantly.',
        'markdown-editor': 'Write and preview Markdown in real-time with syntax highlighting and instant HTML output.',
        'lorem-generator': 'Generate placeholder Lorem Ipsum text in paragraphs, sentences, or words for design mockups.',
        'json-formatter-validator': 'Format, validate, and beautify JSON data with syntax highlighting and error detection.',
        'json-to-csv-converter': 'Convert JSON arrays to CSV format and vice versa. Supports nested objects and custom delimiters.',
        'base64-encode-decode': 'Encode text to Base64 or decode Base64 strings instantly. Supports UTF-8 and binary data.',
        'url-encode-decode': 'URL encode and decode special characters for safe URL parameter handling and web development.',
        'regex-tester': 'Test and debug regular expressions with real-time matching, capture groups, and pattern explanation.',
        'jwt-decoder': 'Decode and inspect JWT tokens to view header, payload, and signature without verification.',
        'youtube-title-checker': 'Optimize YouTube titles with SEO scoring, power word detection, CTR prediction, and length analysis.',
        'youtube-description-counter': 'Count characters in YouTube descriptions and optimize with keyword suggestions for better video SEO.',
        'instagram-bio-counter': 'Check Instagram bio character limits and optimize your profile bio for maximum engagement impact.',
        'twitter-character-counter': 'Count characters for Twitter/X posts with real-time limit tracking. Supports threads and replies.',
        'hashtag-counter': 'Count, analyze, and optimize hashtags across platforms with spam detection and quality scoring.',
        'page-size-checker': 'Measure webpage file size, load time, and resource breakdown for performance optimization.',
        'http-header-viewer': 'Inspect HTTP response headers for any URL to debug caching, security, and server configuration.',
        'user-agent-parser': 'Parse and decode user agent strings to identify browser, OS, device type, and rendering engine.',
        'doc-to-pdf': 'Convert Word documents (DOC/DOCX) to PDF format with proper formatting, headings, and layouts preserved.',
        'pdf-to-doc': 'Extract text from PDF files and convert to Word format with intelligent paragraph and heading detection.',
        'csv-to-xlsx': 'Convert CSV files to Excel spreadsheets (XLSX) with automatic column formatting and data type detection.',
        'xlsx-to-csv': 'Export Excel spreadsheets to clean CSV format with customizable delimiters and encoding options.',
        'power-audio-converter': 'Convert audio files between MP3, WAV, OGG, and more formats with quality and bitrate control.',
        'video-to-mp3': 'Extract audio tracks from video files and save as MP3 with customizable quality settings.',
        'png-to-jpg': 'Convert PNG images to JPG format with adjustable quality. Reduce file size while preserving clarity.',
        'jpg-to-png': 'Convert JPG images to lossless PNG format. Perfect for images that need transparency support.',
        'image-to-webp': 'Convert images to WebP format for up to 30% smaller file sizes with excellent quality retention.',
        'webp-to-png': 'Convert WebP images to universally compatible PNG format for maximum device and browser support.',
        'image-resizer': 'Resize images to exact dimensions or percentages while maintaining aspect ratio and quality.',
        'image-to-base64': 'Convert images to Base64 data URLs for embedding directly in HTML, CSS, or JavaScript code.',
        'image-compressor': 'Compress images up to 80% smaller without visible quality loss. Supports JPG, PNG, and WebP.',
        'csv-to-json': 'Convert CSV data to structured JSON format with automatic type detection and nested object support.',
        'json-to-csv': 'Flatten JSON data into CSV tables with header extraction and customizable column mapping.',
        'markdown-to-html': 'Convert Markdown syntax to clean, semantic HTML with proper heading hierarchy and code blocks.',
        'html-to-markdown': 'Convert HTML pages to clean Markdown format. Perfect for documentation and content migration.',
        'xml-to-json': 'Transform XML documents to JSON format with attribute handling and namespace support.',
        'json-to-xml': 'Convert JSON data structures to well-formed XML with proper element nesting and attributes.',
        'power-zip-creator': 'Create ZIP archives from multiple files with adjustable compression levels. Fast and secure.',
        'zip-extractor': 'Extract files from ZIP archives directly in your browser. Preview contents before downloading.',
        'text-to-pdf': 'Convert plain text to professionally formatted PDF documents with font and page size options.',
        'html-to-pdf': 'Render HTML content as pixel-perfect PDF documents with CSS styling and layout preservation.',
        'js-minifier': 'Minify JavaScript code by removing whitespace, comments, and shortening variable names.',
        'css-minifier': 'Compress CSS files by removing whitespace, comments, and optimizing property values.',
        'html-minifier': 'Minify HTML by removing comments, whitespace, and optional tags for faster page loads.',
        'code-beautifier': 'Format and beautify JavaScript, CSS, HTML, and JSON code with customizable indentation.',
        'qr-generator': 'Generate QR codes from any text, URL, or data with customizable size, colors, and error correction.',
        'qr-reader': 'Scan and decode QR codes from uploaded images or camera. Supports all QR code formats.',
        'color-picker': 'Pick colors and convert between HEX, RGB, HSL, and CMYK formats with a visual color wheel.',
        'color-palette': 'Generate beautiful, harmonious color palettes for design projects with export options.',
        'password-generator': 'Generate cryptographically strong passwords with customizable length, characters, and complexity.',
        'hash-generator': 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes for text strings and file integrity checks.',
        'text-to-speech': 'Convert text to natural speech with multiple voices, adjustable speed, pitch, and volume controls.',
        'favicon-generator': 'Create favicons from images in multiple sizes (16x16 to 512x512) for websites and web apps.',
        'pdf-merger': 'Merge multiple PDF files into a single document. Reorder pages and combine documents easily.',
        '3d-model-viewer': 'View and inspect 3D models (GLB/GLTF) in your browser with rotation, zoom, and lighting controls.',
        'font-previewer': 'Preview fonts with custom text, sizes, and styles. Load Google Fonts or upload your own font files.',
        'keyboard-tester': 'Test every key on your keyboard with a visual layout. Detect stuck or non-working keys instantly.',
        'typing-test': 'Measure your typing speed (WPM) and accuracy with timed tests and real-time performance tracking.',
    };

    // Filter tools
    const filteredTools = allTools.filter(tool => {
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.slug.replace(/-/g, ' ').includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? tool.category === selectedCategory : true;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex min-h-screen flex-col bg-slate-50">
            <Header />

            <main className="flex-1 bg-slate-50">
                {/* Hero */}
                <section className="bg-white border-b border-slate-100 pt-20 pb-12 md:pt-24 md:pb-16">
                    <div className="container mx-auto px-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-indigo-600 mb-4 md:mb-6">
                            <Wrench className="h-4 w-4" />
                            {allTools.length}+ Professional Tools
                        </div>

                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 md:mb-4 tracking-tight px-2">
                            All Tools in One Place
                        </h1>

                        <p className="text-sm sm:text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-8 md:mb-10 px-4">
                            Powerful, fast, and completely free. No sign-up required — just tools that work.
                        </p>

                        {/* Search */}
                        <div className="max-w-xl mx-auto px-4 md:px-0">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-200"></div>
                                <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-slate-400 pointer-events-none z-10" />
                                <Input
                                    type="text"
                                    placeholder="Search tools..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="relative h-11 md:h-14 pl-10 md:pl-12 pr-10 md:pr-12 rounded-full border-2 border-slate-200 focus:border-indigo-500 shadow-sm text-sm md:text-base"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                                    >
                                        <X className="h-4 w-4 md:h-5 md:w-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Filters - Horizontal Scroll on Mobile */}
                        <div className="mt-6 md:mt-8 -mx-4 md:mx-0">
                            <div className="flex md:flex-wrap gap-2 px-4 md:px-0 md:justify-center overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                <Button
                                    variant={selectedCategory === null ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(null)}
                                    className="rounded-full flex-shrink-0 text-xs md:text-sm h-9 md:h-10"
                                >
                                    All ({allTools.length})
                                </Button>
                                {categories.map((category) => {
                                    const count = allTools.filter(t => t.category === category).length;
                                    return (
                                        <Button
                                            key={category}
                                            variant={selectedCategory === category ? 'primary' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedCategory(category)}
                                            className="rounded-full flex-shrink-0 text-xs md:text-sm h-9 md:h-10"
                                        >
                                            {category} ({count})
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                </section>

                {/* Tools */}
                <section className="py-12 md:py-16 lg:py-20">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-6 md:mb-8">
                            <p className="text-sm md:text-base text-slate-500">
                                Showing <span className="font-bold text-slate-900">{filteredTools.length}</span> tools
                                {selectedCategory && <span> in <span className="font-medium text-indigo-600">{selectedCategory}</span></span>}
                                {searchQuery && <span> matching "<span className="font-medium">{searchQuery}</span>"</span>}
                            </p>
                        </div>

                        {/* Tools Grid - Centered */}
                        {filteredTools.length > 0 ? (
                            <div className="flex justify-center">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 max-w-7xl w-full">
                                    <AnimatePresence>
                                        {filteredTools.map((tool) => (
                                            <motion.div
                                                key={tool.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ToolCard
                                                    slug={tool.slug}
                                                    name={tool.name}
                                                    description={toolDescriptions[tool.slug] || `Professional ${tool.name.toLowerCase()} — fast, secure, and browser-based.`}
                                                    category={tool.category}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
                                    <Search className="h-10 w-10 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No tools found</h3>
                                <p className="text-slate-500 mb-6">Try adjusting your search or filters.</p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

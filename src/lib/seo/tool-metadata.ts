/**
 * SEO Metadata for All Tools
 * Comprehensive, keyword-rich metadata for search engine optimization.
 */

export interface ToolSEO {
    title: string;
    description: string;
    keywords: string[];
    h1: string;
    h2: string;
    faq: Array<{ question: string; answer: string }>;
}

export const TOOL_SEO_METADATA: Record<string, ToolSEO> = {
    // ============ SEO TOOLS ============
    'meta-title-pixel-checker': {
        title: 'Meta Title Pixel Checker - Check Title Length & SERP Preview | Free Tool',
        description: 'Free Meta Title Pixel Checker. Verify your title tag length in pixels for Google SERP. See desktop & mobile preview. Avoid truncation. 100% accurate.',
        keywords: ['meta title checker', 'title tag pixel width', 'SERP preview', 'SEO title length', 'Google title checker'],
        h1: 'Meta Title Pixel Checker',
        h2: 'Check Your Title Tag Length in Pixels',
        faq: [
            { question: 'What is the ideal meta title length?', answer: 'Google displays approximately 580 pixels on desktop and 920 pixels on mobile. Aim for 50-60 characters or under 580 pixels to avoid truncation.' },
            { question: 'Why does pixel width matter for titles?', answer: 'Characters have different widths. "W" is wider than "i". Pixel measurement is more accurate than character count for predicting SERP display.' }
        ]
    },
    'meta-description-pixel-checker': {
        title: 'Meta Description Checker - Check Length & SERP Preview | Free Tool',
        description: 'Free Meta Description Checker. Verify your meta description length in pixels for Google. See SERP preview. Optimize for higher CTR. No signup required.',
        keywords: ['meta description checker', 'description length', 'SERP preview', 'meta description pixel', 'SEO description'],
        h1: 'Meta Description Checker',
        h2: 'Optimize Your Meta Description for Search',
        faq: [
            { question: 'What is the ideal meta description length?', answer: 'Google typically displays 155-160 characters or about 920 pixels. Keep descriptions concise and compelling.' },
            { question: 'Does meta description affect rankings?', answer: 'Not directly, but a compelling description improves click-through rate (CTR), which can indirectly boost rankings.' }
        ]
    },
    'robots-txt-validator': {
        title: 'Robots.txt Validator & Tester - Check Syntax Errors | Free Tool',
        description: 'Free Robots.txt Validator. Check for syntax errors, test URLs, and ensure search engines can crawl your site correctly. Instant validation.',
        keywords: ['robots.txt validator', 'robots.txt tester', 'robots.txt checker', 'robots.txt syntax', 'crawl testing'],
        h1: 'Robots.txt Validator',
        h2: 'Validate Your Robots.txt File',
        faq: [
            { question: 'What is robots.txt?', answer: 'Robots.txt is a file that tells search engine crawlers which pages to crawl or ignore on your website.' },
            { question: 'Can robots.txt block pages from appearing in search?', answer: 'Yes, but to fully block pages, use noindex meta tags. Robots.txt only blocks crawling, not indexing of already-known pages.' }
        ]
    },
    'xml-sitemap-url-counter': {
        title: 'XML Sitemap Counter & URL Extractor - Analyze Sitemap | Free Tool',
        description: 'Free XML Sitemap Counter. Count URLs, extract all links, check last modified dates. Analyze your sitemap structure instantly. No signup required.',
        keywords: ['sitemap counter', 'xml sitemap checker', 'sitemap url extractor', 'sitemap analyzer', 'sitemap validator'],
        h1: 'XML Sitemap URL Counter',
        h2: 'Count and Extract URLs from Your Sitemap',
        faq: [
            { question: 'How many URLs can a sitemap contain?', answer: 'A single sitemap can contain up to 50,000 URLs and must be under 50MB uncompressed.' },
            { question: 'Should I submit my sitemap to Google?', answer: 'Yes, submit your sitemap through Google Search Console to help Google discover your pages faster.' }
        ]
    },
    'canonical-url-checker': {
        title: 'Canonical URL Checker - Detect Duplicate Content Issues | Free Tool',
        description: 'Free Canonical URL Checker. Identify canonical tag issues, prevent duplicate content penalties, and consolidate page authority. Instant analysis.',
        keywords: ['canonical url checker', 'canonical tag', 'duplicate content', 'rel canonical', 'SEO canonical'],
        h1: 'Canonical URL Checker',
        h2: 'Check and Validate Canonical Tags',
        faq: [
            { question: 'What is a canonical URL?', answer: 'A canonical URL tells search engines which version of a page is the "master" version when duplicate or similar content exists.' },
            { question: 'When should I use canonical tags?', answer: 'Use canonical tags when you have duplicate content, URL parameters, or multiple URLs pointing to similar content.' }
        ]
    },
    'heading-structure-analyzer': {
        title: 'Heading Analyzer H1-H6 - Check Heading Structure | Free SEO Tool',
        description: 'Free Heading Structure Analyzer. Check H1-H6 hierarchy, find missing headings, and optimize your page structure for SEO. Instant analysis.',
        keywords: ['heading analyzer', 'h1 checker', 'heading structure', 'h1 h2 h3', 'SEO headings'],
        h1: 'Heading Structure Analyzer',
        h2: 'Analyze Your H1-H6 Heading Hierarchy',
        faq: [
            { question: 'Should every page have an H1?', answer: 'Yes, every page should have exactly one H1 tag that describes the main topic of the page.' },
            { question: 'Does heading structure affect SEO?', answer: 'Yes, proper heading hierarchy helps search engines understand your content structure and improves accessibility.' }
        ]
    },
    'keyword-density-checker': {
        title: 'Keyword Density Checker - Analyze Keyword Usage | Free SEO Tool',
        description: 'Free Keyword Density Checker. Calculate keyword frequency, avoid over-optimization, and optimize your content. See top keywords instantly.',
        keywords: ['keyword density', 'keyword checker', 'keyword frequency', 'keyword stuffing', 'SEO keywords'],
        h1: 'Keyword Density Checker',
        h2: 'Analyze Your Keyword Usage',
        faq: [
            { question: 'What is ideal keyword density?', answer: 'There is no magic number, but 1-2% is generally considered natural. Focus on readability over exact percentages.' },
            { question: 'Can high keyword density hurt SEO?', answer: 'Yes, excessive keyword usage (keyword stuffing) can result in search engine penalties.' }
        ]
    },
    'seo-slug-optimizer': {
        title: 'URL Slug Optimizer - Create SEO-Friendly URLs | Free Tool',
        description: 'Free URL Slug Optimizer. Create clean, SEO-friendly slugs from any text. Remove special characters, convert to lowercase. Instant generation.',
        keywords: ['slug optimizer', 'url slug', 'seo friendly url', 'permalink generator', 'url generator'],
        h1: 'SEO Slug Optimizer',
        h2: 'Create SEO-Friendly URL Slugs',
        faq: [
            { question: 'What makes a good URL slug?', answer: 'A good slug is short, descriptive, uses hyphens, contains keywords, and avoids special characters.' },
            { question: 'Do URL slugs affect SEO?', answer: 'Yes, clean URLs with relevant keywords can improve click-through rates and provide context to search engines.' }
        ]
    },
    'serp-preview-tool': {
        title: 'SERP Preview Tool - See How Your Page Looks in Google | Free Tool',
        description: 'Free Google SERP Preview Tool. See exactly how your page appears in search results. Preview desktop and mobile. Optimize for clicks.',
        keywords: ['SERP preview', 'Google preview', 'search result preview', 'SERP simulator', 'meta preview'],
        h1: 'SERP Preview Tool',
        h2: 'Preview Your Google Search Result',
        faq: [
            { question: 'Why use a SERP preview tool?', answer: 'To see how your title and description appear in search results before publishing, ensuring they display correctly and attract clicks.' },
            { question: 'Does Google always show my meta description?', answer: 'No, Google may generate its own description from page content if it thinks it matches the search query better.' }
        ]
    },
    'noindex-nofollow-checker': {
        title: 'Noindex Nofollow Checker - Check Meta Robots Tags | Free Tool',
        description: 'Free Noindex/Nofollow Checker. Detect meta robots tags, find blocked pages, and ensure proper indexing. Instant HTML analysis.',
        keywords: ['noindex checker', 'nofollow checker', 'meta robots', 'robots meta tag', 'indexing checker'],
        h1: 'Noindex/Nofollow Checker',
        h2: 'Check Your Meta Robots Tags',
        faq: [
            { question: 'What does noindex mean?', answer: 'Noindex tells search engines not to include the page in their search results index.' },
            { question: 'What is the difference between noindex and nofollow?', answer: 'Noindex prevents indexing. Nofollow tells crawlers not to follow links on the page.' }
        ]
    },

    // ============ DEVELOPER TOOLS ============
    'json-formatter-validator': {
        title: 'JSON Formatter & Validator - Format and Validate JSON | Free Tool',
        description: 'Free JSON Formatter and Validator. Beautify, minify, and validate JSON data. Syntax highlighting, error detection. Works offline.',
        keywords: ['json formatter', 'json validator', 'json beautifier', 'json minifier', 'json parser'],
        h1: 'JSON Formatter & Validator',
        h2: 'Format and Validate Your JSON Data',
        faq: [
            { question: 'What is JSON?', answer: 'JSON (JavaScript Object Notation) is a lightweight data format used for storing and exchanging data.' },
            { question: 'How do I validate JSON?', answer: 'Paste your JSON into the tool. It will automatically detect syntax errors and highlight issues.' }
        ]
    },
    'json-to-csv-converter': {
        title: 'JSON to CSV Converter - Convert JSON Data to CSV | Free Tool',
        description: 'Free JSON to CSV Converter. Transform JSON arrays into CSV format for Excel. Download results instantly. No file size limits.',
        keywords: ['json to csv', 'json csv converter', 'convert json', 'json to excel', 'json export'],
        h1: 'JSON to CSV Converter',
        h2: 'Convert JSON Data to CSV Format',
        faq: [
            { question: 'Can I convert nested JSON?', answer: 'The converter flattens simple nested objects. Complex nested arrays may need manual adjustment.' },
            { question: 'Is there a file size limit?', answer: 'No, conversion happens in your browser with no size limits or uploads.' }
        ]
    },
    'base64-encode-decode': {
        title: 'Base64 Encoder & Decoder - Encode/Decode Base64 | Free Tool',
        description: 'Free Base64 Encoder and Decoder. Convert text to Base64 and back. Support for files and images. Instant encoding/decoding.',
        keywords: ['base64 encoder', 'base64 decoder', 'base64 converter', 'encode base64', 'decode base64'],
        h1: 'Base64 Encoder & Decoder',
        h2: 'Encode and Decode Base64 Strings',
        faq: [
            { question: 'What is Base64 encoding?', answer: 'Base64 is a binary-to-text encoding that represents binary data in ASCII characters, useful for transmitting data over text-based protocols.' },
            { question: 'Is my data secure?', answer: 'Yes, all encoding/decoding happens in your browser. No data is sent to any server.' }
        ]
    },
    'url-encode-decode': {
        title: 'URL Encoder & Decoder - Encode/Decode URL Strings | Free Tool',
        description: 'Free URL Encoder and Decoder. Encode special characters for URLs or decode percent-encoded strings. Essential for developers.',
        keywords: ['url encoder', 'url decoder', 'percent encoding', 'urlencode', 'urldecode'],
        h1: 'URL Encoder & Decoder',
        h2: 'Encode and Decode URL Strings',
        faq: [
            { question: 'Why encode URLs?', answer: 'URL encoding converts special characters to a format that can be transmitted over the internet safely.' },
            { question: 'What characters need encoding?', answer: 'Spaces, ampersands, question marks, and other special characters must be percent-encoded in URLs.' }
        ]
    },
    'regex-tester': {
        title: 'Regex Tester - Test Regular Expressions Online | Free Tool',
        description: 'Free Online Regex Tester. Test and debug regular expressions in real-time. Support for JavaScript, Python, and more. Syntax highlighting.',
        keywords: ['regex tester', 'regular expression', 'regex debugger', 'regex validator', 'regex online'],
        h1: 'Regex Tester',
        h2: 'Test Your Regular Expressions Online',
        faq: [
            { question: 'What is regex?', answer: 'Regex (regular expressions) are patterns used to match character combinations in strings for search, validation, and extraction.' },
            { question: 'Are regex patterns case-sensitive?', answer: 'By default yes, but you can use the "i" flag to make patterns case-insensitive.' }
        ]
    },
    'jwt-decoder': {
        title: 'JWT Decoder - Decode JSON Web Tokens | Free Tool',
        description: 'Free JWT Decoder. Decode and inspect JSON Web Tokens. View header, payload, and signature. Verify token expiration. Privacy-focused.',
        keywords: ['jwt decoder', 'json web token', 'jwt parser', 'jwt validator', 'decode jwt'],
        h1: 'JWT Decoder',
        h2: 'Decode and Inspect JWT Tokens',
        faq: [
            { question: 'What is a JWT?', answer: 'JWT (JSON Web Token) is a compact, URL-safe token format used for securely transmitting information between parties.' },
            { question: 'Is my JWT decoded securely?', answer: 'Yes, decoding happens entirely in your browser. No tokens are sent to any server.' }
        ]
    },

    // ============ TEXT TOOLS ============
    'word-counter': {
        title: 'Word Counter - Count Words, Characters & Sentences | Free Tool',
        description: 'Free Word Counter Tool. Count words, characters, sentences, and paragraphs. Calculate reading time. Real-time counting as you type.',
        keywords: ['word counter', 'character counter', 'word count', 'text counter', 'reading time'],
        h1: 'Word Counter',
        h2: 'Count Words, Characters, and More',
        faq: [
            { question: 'How is reading time calculated?', answer: 'Based on an average reading speed of 200-250 words per minute for adults.' },
            { question: 'Does it count punctuation as characters?', answer: 'Yes, all characters including spaces and punctuation are counted.' }
        ]
    },
    'character-counter': {
        title: 'Character Counter - Count Characters with/without Spaces | Free Tool',
        description: 'Free Character Counter. Count characters with and without spaces. Track Twitter, Instagram, and other platform limits in real-time.',
        keywords: ['character counter', 'letter counter', 'char count', 'character limit', 'text length'],
        h1: 'Character Counter',
        h2: 'Count Characters With and Without Spaces',
        faq: [
            { question: 'What is the Twitter character limit?', answer: 'Twitter/X allows 280 characters per tweet, or 25,000 for Twitter Premium subscribers.' },
            { question: 'How are emojis counted?', answer: 'Most emojis count as 2 characters due to their Unicode encoding.' }
        ]
    },
    'case-converter': {
        title: 'Case Converter - Convert Text Case Online | Free Tool',
        description: 'Free Case Converter. Convert text to UPPERCASE, lowercase, Title Case, Sentence case, and more. Instant text transformation.',
        keywords: ['case converter', 'uppercase converter', 'lowercase converter', 'title case', 'text case'],
        h1: 'Case Converter',
        h2: 'Convert Text Between Different Cases',
        faq: [
            { question: 'What is Title Case?', answer: 'Title Case capitalizes the first letter of each word, commonly used for headlines and titles.' },
            { question: 'What is Sentence case?', answer: 'Sentence case capitalizes only the first letter of the first word and proper nouns.' }
        ]
    },
    'remove-duplicate-lines': {
        title: 'Remove Duplicate Lines - Delete Duplicate Text Lines | Free Tool',
        description: 'Free Duplicate Line Remover. Remove duplicate lines from text instantly. Keep unique lines only. Case-sensitive or insensitive options.',
        keywords: ['remove duplicates', 'duplicate line remover', 'unique lines', 'text deduplication', 'delete duplicates'],
        h1: 'Remove Duplicate Lines',
        h2: 'Delete Duplicate Lines from Your Text',
        faq: [
            { question: 'Does it preserve line order?', answer: 'Yes, the original order of unique lines is preserved.' },
            { question: 'Is the comparison case-sensitive?', answer: 'You can choose between case-sensitive and case-insensitive duplicate detection.' }
        ]
    },
    'text-diff-checker': {
        title: 'Text Diff Checker - Compare Two Texts | Free Tool',
        description: 'Free Text Diff Checker. Compare two texts side-by-side. Highlight additions, deletions, and changes. Perfect for code reviews.',
        keywords: ['diff checker', 'text compare', 'text diff', 'compare text', 'difference checker'],
        h1: 'Text Diff Checker',
        h2: 'Compare Two Texts and Find Differences',
        faq: [
            { question: 'What do the colors mean?', answer: 'Green highlights additions, red shows deletions, and yellow indicates modifications.' },
            { question: 'Can I compare code?', answer: 'Yes, the diff checker works with any text including source code.' }
        ]
    },
    'whitespace-cleaner': {
        title: 'Whitespace Cleaner - Remove Extra Spaces & Tabs | Free Tool',
        description: 'Free Whitespace Cleaner. Remove extra spaces, tabs, and line breaks. Clean up messy text instantly. Multiple cleaning options.',
        keywords: ['whitespace cleaner', 'remove spaces', 'trim whitespace', 'clean text', 'remove tabs'],
        h1: 'Whitespace Cleaner',
        h2: 'Remove Extra Whitespace from Text',
        faq: [
            { question: 'What counts as whitespace?', answer: 'Spaces, tabs, line breaks, and other invisible formatting characters.' },
            { question: 'Will it remove all spaces?', answer: 'No, it removes extra spaces while preserving single spaces between words.' }
        ]
    },

    // ============ SOCIAL MEDIA TOOLS ============
    'youtube-title-checker': {
        title: 'YouTube Title Checker - Optimize Video Titles for SEO | Free Tool',
        description: 'Free YouTube Title Checker. Check title length, get SEO score, and optimize for higher CTR. See character limits and best practices.',
        keywords: ['youtube title checker', 'video title optimizer', 'youtube seo', 'youtube title length', 'youtube optimization'],
        h1: 'YouTube Title Checker',
        h2: 'Optimize Your YouTube Video Titles',
        faq: [
            { question: 'What is the ideal YouTube title length?', answer: 'Keep titles under 60-70 characters to avoid truncation. The maximum is 100 characters.' },
            { question: 'How can I improve my title CTR?', answer: 'Use numbers, power words, create curiosity, and include your main keyword near the beginning.' }
        ]
    },
    'youtube-description-counter': {
        title: 'YouTube Description Counter - Optimize Video Descriptions | Free Tool',
        description: 'Free YouTube Description Counter. Check description length, above-fold preview, and link count. Optimize for maximum engagement.',
        keywords: ['youtube description', 'description counter', 'youtube seo', 'video description', 'youtube optimization'],
        h1: 'YouTube Description Counter',
        h2: 'Optimize Your Video Descriptions',
        faq: [
            { question: 'What is the YouTube description limit?', answer: 'YouTube allows up to 5,000 characters in video descriptions.' },
            { question: 'How much shows above the fold?', answer: 'Only the first 100-150 characters show before the "Show more" button.' }
        ]
    },
    'instagram-bio-counter': {
        title: 'Instagram Bio Counter - Check Bio Character Limit | Free Tool',
        description: 'Free Instagram Bio Counter. Check character count, emoji usage, and line breaks. Optimize your bio for maximum impact. 150 char limit.',
        keywords: ['instagram bio', 'bio counter', 'instagram bio generator', 'instagram bio length', 'bio character limit'],
        h1: 'Instagram Bio Counter',
        h2: 'Optimize Your Instagram Bio',
        faq: [
            { question: 'What is the Instagram bio limit?', answer: 'Instagram allows up to 150 characters in your bio.' },
            { question: 'Can I use emojis in my bio?', answer: 'Yes! Emojis add personality and visual appeal. Each counts as 2 characters.' }
        ]
    },
    'twitter-character-counter': {
        title: 'Twitter Character Counter - Count Tweet Characters | Free Tool',
        description: 'Free Twitter Character Counter. Count characters for tweets. Track the 280-character limit. See remaining characters in real-time.',
        keywords: ['twitter counter', 'tweet counter', 'x character counter', 'twitter character limit', 'tweet length'],
        h1: 'Twitter/X Character Counter',
        h2: 'Count Your Tweet Characters',
        faq: [
            { question: 'What is the tweet character limit?', answer: 'Standard tweets allow 280 characters. Twitter/X Premium users get 25,000 characters.' },
            { question: 'Do URLs count against the limit?', answer: 'All URLs are shortened to 23 characters regardless of actual length.' }
        ]
    },
    'hashtag-counter': {
        title: 'Hashtag Counter - Count and Analyze Hashtags | Free Tool',
        description: 'Free Hashtag Counter. Count hashtags in your text, extract and list them. Perfect for Instagram, Twitter, and TikTok optimization.',
        keywords: ['hashtag counter', 'hashtag extractor', 'count hashtags', 'hashtag generator', 'social media hashtags'],
        h1: 'Hashtag Counter',
        h2: 'Count and Extract Your Hashtags',
        faq: [
            { question: 'How many hashtags should I use?', answer: 'Instagram allows 30 hashtags per post. Research suggests 5-10 relevant hashtags perform best.' },
            { question: 'Do hashtags help with reach?', answer: 'Yes, relevant hashtags can significantly increase your content discoverability.' }
        ]
    },

    // ============ WEB TOOLS ============
    'page-size-checker': {
        title: 'Page Size Checker - Check Website Page Size | Free Tool',
        description: 'Free Page Size Checker. Analyze your page weight, get load time estimates, and optimization tips. Improve Core Web Vitals.',
        keywords: ['page size checker', 'page weight', 'page load time', 'website speed', 'core web vitals'],
        h1: 'Page Size Checker',
        h2: 'Check Your Page Size and Load Time',
        faq: [
            { question: 'What is a good page size?', answer: 'Aim for under 3MB for optimal performance. Pages under 1MB are considered excellent.' },
            { question: 'How does page size affect SEO?', answer: 'Larger pages load slower, which negatively impacts user experience and Core Web Vitals rankings.' }
        ]
    },
    'http-header-viewer': {
        title: 'HTTP Header Viewer - Analyze HTTP Response Headers | Free Tool',
        description: 'Free HTTP Header Viewer. Analyze security headers, caching policies, and CORS settings. Get security score and recommendations.',
        keywords: ['http headers', 'header viewer', 'security headers', 'http response', 'header analyzer'],
        h1: 'HTTP Header Viewer',
        h2: 'Analyze HTTP Response Headers',
        faq: [
            { question: 'What are HTTP headers?', answer: 'Headers are metadata sent with HTTP requests/responses containing info about caching, security, content type, and more.' },
            { question: 'Why are security headers important?', answer: 'Security headers protect against XSS, clickjacking, and other attacks. They also affect your security score.' }
        ]
    },
    'user-agent-parser': {
        title: 'User Agent Parser - Detect Browser & OS | Free Tool',
        description: 'Free User Agent Parser. Parse user agent strings to detect browser, OS, and device type. Useful for analytics and debugging.',
        keywords: ['user agent parser', 'user agent detector', 'browser detection', 'os detection', 'device detection'],
        h1: 'User Agent Parser',
        h2: 'Parse and Analyze User Agent Strings',
        faq: [
            { question: 'What is a user agent?', answer: 'A user agent string identifies the browser, operating system, and device making a request to a web server.' },
            { question: 'Can user agents be spoofed?', answer: 'Yes, user agents can be changed by users or extensions, so they should not be trusted for security.' }
        ]
    },
    'video-to-gif': {
        title: 'Video to GIF Converter - Convert MP4 to GIF Online | Free Tool',
        description: 'Free Video to GIF Converter. Convert MP4, WebM, MOV to animated GIF in your browser. High quality, no watermark, secure client-side processing.',
        keywords: ['video to gif', 'mp4 to gif', 'convert video to gif', 'video converter', 'free gif maker'],
        h1: 'Video to GIF Converter',
        h2: 'Convert Video to Animated GIF',
        faq: [
            { question: 'Is it free to use?', answer: 'Yes, this tool is 100% free and processes files locally in your browser.' },
            { question: 'What formats are supported?', answer: 'We support MP4, WebM, MOV, AVI, and other common video formats.' }
        ]
    },
    'gif-to-video': {
        title: 'GIF to Video Converter - Convert GIF to MP4 Online | Free Tool',
        description: 'Free GIF to Video Converter. Convert animated GIFs to MP4 video for Instagram, TikTok, and WhatsApp. Fast, secure, and high quality.',
        keywords: ['gif to video', 'gif to mp4', 'convert gif to video', 'gif converter', 'video maker'],
        h1: 'GIF to Video Converter',
        h2: 'Convert GIF to MP4 Video',
        faq: [
            { question: 'Why convert GIF to video?', answer: 'Videos (MP4) are smaller in size and supported by platforms like Instagram that do not support GIFs directly.' },
            { question: 'Is the conversion secure?', answer: 'Yes, all processing happens in your browser. Your files are never uploaded to any server.' }
        ]
    }
} as const;

/**
 * Get SEO metadata for a tool
 */
export function getToolSEO(slug: string): ToolSEO | undefined {
    return TOOL_SEO_METADATA[slug];
}

/**
 * Generate JSON-LD structured data for a tool
 */
export function generateToolSchema(slug: string, baseUrl: string): object {
    const seo = getToolSEO(slug);
    if (!seo) return {};

    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: seo.h1,
        url: `${baseUrl}/tools/${slug}`,
        description: seo.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1250'
        }
    };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQSchema(slug: string): object | null {
    const seo = getToolSEO(slug);
    if (!seo || seo.faq.length === 0) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seo.faq.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
            }
        }))
    };
}

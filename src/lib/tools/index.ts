/**
 * Tools Index
 * 
 * Central export for all tool functions organized by category.
 */

// SEO Tools
export * from './seo';

// Text Tools
export * from './text';

// Developer Tools
export * from './developer';

// Social Media Tools
export * from './social';

// Web Analysis Tools
export * from './web';

// Tool metadata registry
export const TOOL_REGISTRY = {
    seo: {
        category: 'SEO',
        tools: [
            { id: 'meta-title-checker', name: 'Meta Title Pixel Checker', slug: 'meta-title-pixel-checker' },
            { id: 'meta-description-checker', name: 'Meta Description Pixel Checker', slug: 'meta-description-pixel-checker' },
            { id: 'robots-validator', name: 'Robots.txt Validator', slug: 'robots-txt-validator' },
            { id: 'sitemap-counter', name: 'XML Sitemap URL Counter', slug: 'xml-sitemap-url-counter' },
            { id: 'canonical-checker', name: 'Canonical URL Checker', slug: 'canonical-url-checker' },
            { id: 'heading-analyzer', name: 'H1-H6 Structure Analyzer', slug: 'heading-structure-analyzer' },
            { id: 'keyword-density', name: 'Keyword Density Checker', slug: 'keyword-density-checker' },
            { id: 'slug-optimizer', name: 'SEO Slug Optimizer', slug: 'seo-slug-optimizer' },
            { id: 'serp-preview', name: 'SERP Preview Tool', slug: 'serp-preview-tool' },
            { id: 'noindex-checker', name: 'Noindex/Nofollow Checker', slug: 'noindex-nofollow-checker' },
            { id: 'seo-checker', name: 'SEO Checker & Score', slug: 'seo-checker' },
        ],
    },
    text: {
        category: 'Text',
        tools: [
            { id: 'word-counter', name: 'Word Counter', slug: 'word-counter' },
            { id: 'character-counter', name: 'Character Counter', slug: 'character-counter' },
            { id: 'case-converter', name: 'Case Converter', slug: 'case-converter' },
            { id: 'duplicate-remover', name: 'Remove Duplicate Lines', slug: 'remove-duplicate-lines' },
            { id: 'diff-checker', name: 'Text Diff Checker', slug: 'text-diff-checker' },
            { id: 'whitespace-cleaner', name: 'Whitespace Cleaner', slug: 'whitespace-cleaner' },
            { id: 'markdown-editor', name: 'Markdown Editor', slug: 'markdown-editor' },
            { id: 'lorem-generator', name: 'Lorem Ipsum Generator', slug: 'lorem-generator' },
        ],
    },
    developer: {
        category: 'Developer',
        tools: [
            { id: 'json-formatter', name: 'JSON Formatter & Validator', slug: 'json-formatter-validator' },
            { id: 'json-csv-converter', name: 'JSON to CSV Converter', slug: 'json-to-csv-converter' },
            { id: 'base64-codec', name: 'Base64 Encode/Decode', slug: 'base64-encode-decode' },
            { id: 'url-codec', name: 'URL Encode/Decode', slug: 'url-encode-decode' },
            { id: 'regex-tester', name: 'Regex Tester', slug: 'regex-tester' },
            { id: 'jwt-decoder', name: 'JWT Decoder', slug: 'jwt-decoder' },
            { id: 'website-analyzer', name: 'Website Analyzer', slug: 'website-analyzer' },
            { id: 'website-safety-checker', name: 'Website Safety Checker', slug: 'website-safety-checker' },
        ],
    },
    social: {
        category: 'Social Media',
        tools: [
            { id: 'youtube-title', name: 'YouTube Title Checker', slug: 'youtube-title-checker' },
            { id: 'youtube-description', name: 'YouTube Description Counter', slug: 'youtube-description-counter' },
            { id: 'instagram-bio', name: 'Instagram Bio Counter', slug: 'instagram-bio-counter' },
            { id: 'twitter-counter', name: 'Twitter/X Character Counter', slug: 'twitter-character-counter' },
            { id: 'hashtag-counter', name: 'Hashtag Counter', slug: 'hashtag-counter' },
        ],
    },
    web: {
        category: 'Web Analysis',
        tools: [
            { id: 'page-size-checker', name: 'Page Size Checker', slug: 'page-size-checker' },
            { id: 'http-header-viewer', name: 'HTTP Header Viewer', slug: 'http-header-viewer' },
            { id: 'user-agent-parser', name: 'User Agent Parser', slug: 'user-agent-parser' },
        ],
    },
    converter: {
        category: 'Converter',
        tools: [
            // Document Converters
            { id: 'doc-to-pdf', name: 'DOC to PDF Converter', slug: 'doc-to-pdf' },
            { id: 'pdf-to-doc', name: 'PDF to Word Converter', slug: 'pdf-to-doc' },
            { id: 'pdf-to-image', name: 'PDF to Image Converter', slug: 'pdf-to-image' },
            { id: 'csv-to-xlsx', name: 'CSV to Excel Converter', slug: 'csv-to-xlsx' },
            { id: 'xlsx-to-csv', name: 'Excel to CSV Converter', slug: 'xlsx-to-csv' },
            // Audio/Video Converters
            { id: 'power-audio-converter', name: 'Audio Converter', slug: 'power-audio-converter' },
            { id: 'video-to-mp3', name: 'Video to MP3', slug: 'video-to-mp3' },
            { id: 'video-to-gif', name: 'Video to GIF Converter', slug: 'video-to-gif' },
            { id: 'gif-to-video', name: 'GIF to Video Converter', slug: 'gif-to-video' },
            // Image Converters
            { id: 'png-to-jpg', name: 'PNG to JPG Converter', slug: 'png-to-jpg' },
            { id: 'jpg-to-png', name: 'JPG to PNG Converter', slug: 'jpg-to-png' },
            { id: 'svg-to-png', name: 'SVG to PNG Converter', slug: 'svg-to-png' },
            { id: 'image-to-webp', name: 'Image to WebP Converter', slug: 'image-to-webp' },
            { id: 'webp-to-png', name: 'WebP to PNG Converter', slug: 'webp-to-png' },
            { id: 'image-resizer', name: 'Image Resizer', slug: 'image-resizer' },
            { id: 'image-to-base64', name: 'Image to Base64', slug: 'image-to-base64' },
            { id: 'image-compressor', name: 'Image Compressor', slug: 'image-compressor' },
            // Data Converters
            { id: 'csv-to-json', name: 'CSV to JSON Converter', slug: 'csv-to-json' },
            { id: 'json-to-csv', name: 'JSON to CSV Converter', slug: 'json-to-csv' },
            { id: 'markdown-to-html', name: 'Markdown to HTML', slug: 'markdown-to-html' },
            { id: 'html-to-markdown', name: 'HTML to Markdown', slug: 'html-to-markdown' },
            { id: 'xml-to-json', name: 'XML to JSON Converter', slug: 'xml-to-json' },
            { id: 'json-to-xml', name: 'JSON to XML Converter', slug: 'json-to-xml' },
            { id: 'json-to-yaml', name: 'JSON to YAML Converter', slug: 'json-to-yaml' },
        ],
    },
    utility: {
        category: 'Utility',
        tools: [
            { id: 'zip-creator', name: 'ZIP Creator', slug: 'power-zip-creator' },
            { id: 'zip-extractor', name: 'ZIP Extractor', slug: 'zip-extractor' },
            { id: 'text-to-pdf', name: 'Text to PDF', slug: 'text-to-pdf' },
            { id: 'html-to-pdf', name: 'HTML to PDF', slug: 'html-to-pdf' },
            { id: 'js-minifier', name: 'JavaScript Minifier', slug: 'js-minifier' },
            { id: 'css-minifier', name: 'CSS Minifier', slug: 'css-minifier' },
            { id: 'html-minifier', name: 'HTML Minifier', slug: 'html-minifier' },
            { id: 'code-beautifier', name: 'Code Beautifier', slug: 'code-beautifier' },
            { id: 'qr-generator', name: 'QR Code Generator', slug: 'qr-generator' },
            { id: 'qr-reader', name: 'QR Code Reader', slug: 'qr-reader' },
            { id: 'color-picker', name: 'Color Picker & Converter', slug: 'color-picker' },
            { id: 'color-palette', name: 'Color Palette Generator', slug: 'color-palette' },
            { id: 'password-generator', name: 'Password Generator', slug: 'password-generator' },
            { id: 'hash-generator', name: 'Hash Generator', slug: 'hash-generator' },
            { id: 'favicon-generator', name: 'Favicon Generator', slug: 'favicon-generator' },
            { id: 'pdf-merger', name: 'PDF Merger', slug: 'pdf-merger' },
            { id: 'keyboard-tester', name: 'Keyboard Tester', slug: 'keyboard-tester' },
            { id: 'typing-test', name: 'Typing Speed Test', slug: 'typing-test' },
        ],
    },
    preview: {
        category: 'File Preview',
        tools: [
            { id: '3d-model-viewer', name: '3D Model Viewer', slug: '3d-model-viewer' },
            { id: 'font-previewer', name: 'Font Previewer', slug: 'font-previewer' },
            { id: 'csv-previewer', name: 'CSV Previewer', slug: 'csv-previewer' },
            { id: 'xlsx-previewer', name: 'Excel Previewer', slug: 'xlsx-previewer' },
            { id: 'pdf-previewer', name: 'PDF Previewer', slug: 'pdf-previewer' },
            { id: 'json-previewer', name: 'JSON Previewer', slug: 'json-previewer' },
            { id: 'markdown-previewer', name: 'Markdown Previewer', slug: 'markdown-previewer' },
            { id: 'image-previewer', name: 'Image Previewer', slug: 'image-previewer' },
        ],
    },
} as const;

/**
 * Get all tools as flat array
 */
export function getAllTools(): Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
}> {
    const tools: Array<{ id: string; name: string; slug: string; category: string }> = [];

    for (const [, categoryData] of Object.entries(TOOL_REGISTRY)) {
        for (const tool of categoryData.tools) {
            tools.push({
                ...tool,
                category: categoryData.category,
            });
        }
    }

    return tools;
}

/**
 * Get tool by slug
 */
export function getToolBySlug(slug: string): {
    id: string;
    name: string;
    slug: string;
    category: string;
} | undefined {
    for (const [, categoryData] of Object.entries(TOOL_REGISTRY)) {
        const tool = categoryData.tools.find(t => t.slug === slug);
        if (tool) {
            return {
                ...tool,
                category: categoryData.category,
            };
        }
    }
    return undefined;
}

/**
 * Get tools by category
 */
export function getToolsByCategory(categoryKey: keyof typeof TOOL_REGISTRY): Array<{
    id: string;
    name: string;
    slug: string;
}> {
    return [...TOOL_REGISTRY[categoryKey].tools];
}

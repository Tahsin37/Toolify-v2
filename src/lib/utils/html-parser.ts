/**
 * HTML Parser Utilities
 * 
 * Lightweight HTML parsing utilities for extracting SEO elements.
 * Uses regex-based parsing to avoid heavy dependencies.
 */

export interface ParsedTag {
    tag: string;
    attributes: Record<string, string>;
    content: string;
    fullMatch: string;
}

/**
 * Extract all occurrences of a tag from HTML
 */
export function extractTags(html: string, tagName: string): ParsedTag[] {
    const results: ParsedTag[] = [];

    // Match both self-closing and regular tags
    const selfClosingPattern = new RegExp(
        `<${tagName}\\s*([^>]*?)\\s*\\/?>`,
        'gi'
    );

    const regularPattern = new RegExp(
        `<${tagName}\\s*([^>]*)>([\\s\\S]*?)<\\/${tagName}>`,
        'gi'
    );

    // Extract self-closing tags (like <meta>, <link>)
    let match;
    while ((match = selfClosingPattern.exec(html)) !== null) {
        const attributes = parseAttributes(match[1]);
        results.push({
            tag: tagName.toLowerCase(),
            attributes,
            content: '',
            fullMatch: match[0],
        });
    }

    // Extract regular tags with content
    while ((match = regularPattern.exec(html)) !== null) {
        const attributes = parseAttributes(match[1]);
        results.push({
            tag: tagName.toLowerCase(),
            attributes,
            content: match[2].trim(),
            fullMatch: match[0],
        });
    }

    return results;
}

/**
 * Parse HTML attributes from a string
 */
export function parseAttributes(attrString: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    if (!attrString) return attributes;

    // Match key="value" or key='value' or key=value or just key
    const attrPattern = /(\w+[-\w]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;

    let match;
    while ((match = attrPattern.exec(attrString)) !== null) {
        const key = match[1].toLowerCase();
        const value = match[2] ?? match[3] ?? match[4] ?? '';
        attributes[key] = value;
    }

    return attributes;
}

/**
 * Extract meta tag content by name or property
 */
export function getMetaContent(html: string, nameOrProperty: string): string | null {
    const metaTags = extractTags(html, 'meta');

    for (const meta of metaTags) {
        const name = meta.attributes.name || meta.attributes.property;
        if (name?.toLowerCase() === nameOrProperty.toLowerCase()) {
            return meta.attributes.content || null;
        }
    }

    return null;
}

/**
 * Extract all headings from HTML
 */
export function extractHeadings(html: string): Array<{ level: number; text: string; index: number }> {
    const headings: Array<{ level: number; text: string; index: number }> = [];

    const headingPattern = /<h([1-6])(?:\s[^>]*)?>([^<]*(?:<(?!\/h[1-6]>)[^<]*)*)<\/h[1-6]>/gi;

    let match;
    let index = 0;
    while ((match = headingPattern.exec(html)) !== null) {
        const level = parseInt(match[1], 10);
        // Strip nested HTML tags from heading content
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        headings.push({ level, text, index });
        index++;
    }

    return headings;
}

/**
 * Extract canonical URL from HTML
 */
export function extractCanonical(html: string): string | null {
    const linkTags = extractTags(html, 'link');

    for (const link of linkTags) {
        if (link.attributes.rel?.toLowerCase() === 'canonical') {
            return link.attributes.href || null;
        }
    }

    return null;
}

/**
 * Extract title tag content
 */
export function extractTitle(html: string): string | null {
    const titleTags = extractTags(html, 'title');
    return titleTags[0]?.content || null;
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHtml(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Extract all links from HTML
 */
export function extractLinks(html: string): Array<{ href: string; text: string; rel?: string }> {
    const links: Array<{ href: string; text: string; rel?: string }> = [];

    const linkPattern = /<a\s+([^>]*)>([^<]*(?:<(?!\/a>)[^<]*)*)<\/a>/gi;

    let match;
    while ((match = linkPattern.exec(html)) !== null) {
        const attributes = parseAttributes(match[1]);
        const text = match[2].replace(/<[^>]+>/g, '').trim();

        if (attributes.href) {
            links.push({
                href: attributes.href,
                text,
                rel: attributes.rel,
            });
        }
    }

    return links;
}

/**
 * Check if HTML contains specific meta robots directive
 */
export function hasMetaRobotsDirective(html: string, directive: string): boolean {
    const robotsContent = getMetaContent(html, 'robots');
    if (!robotsContent) return false;

    const directives = robotsContent.toLowerCase().split(',').map(d => d.trim());
    return directives.includes(directive.toLowerCase());
}

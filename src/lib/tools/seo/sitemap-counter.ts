/**
 * XML Sitemap URL Counter
 * 
 * Parses XML sitemaps and counts URLs, with support for sitemap indexes.
 */

import type { ToolResult, SitemapResult } from '@/lib/types';

export interface SitemapInput {
    content: string;
}

/**
 * Extract URLs from sitemap XML content
 */
function extractUrls(xml: string): string[] {
    const urls: string[] = [];

    // Match <loc> tags (works for both regular sitemaps and sitemap indexes)
    const locPattern = /<loc>\s*([^<]+)\s*<\/loc>/gi;

    let match;
    while ((match = locPattern.exec(xml)) !== null) {
        const url = match[1].trim();
        if (url) {
            urls.push(url);
        }
    }

    return urls;
}

/**
 * Extract lastmod dates from sitemap
 */
function extractLastModDates(xml: string): string[] {
    const dates: string[] = [];

    const lastmodPattern = /<lastmod>\s*([^<]+)\s*<\/lastmod>/gi;

    let match;
    while ((match = lastmodPattern.exec(xml)) !== null) {
        const date = match[1].trim();
        if (date) {
            dates.push(date);
        }
    }

    return dates;
}

/**
 * Check if content is a sitemap index
 */
function isSitemapIndex(xml: string): boolean {
    return /<sitemapindex/i.test(xml);
}

/**
 * Validate XML structure
 */
function validateXmlStructure(xml: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for XML declaration
    if (!xml.trim().startsWith('<?xml')) {
        errors.push('Missing XML declaration');
    }

    // Check for namespace
    if (!xml.includes('xmlns')) {
        errors.push('Missing XML namespace declaration');
    }

    // Check for proper sitemap or sitemapindex root element
    const hasUrlset = /<urlset/i.test(xml);
    const hasSitemapindex = /<sitemapindex/i.test(xml);

    if (!hasUrlset && !hasSitemapindex) {
        errors.push('Missing <urlset> or <sitemapindex> root element');
    }

    // Check for closing tags
    if (hasUrlset && !/<\/urlset>/i.test(xml)) {
        errors.push('Missing closing </urlset> tag');
    }
    if (hasSitemapindex && !/<\/sitemapindex>/i.test(xml)) {
        errors.push('Missing closing </sitemapindex> tag');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Count and analyze sitemap URLs
 */
export function analyzeSitemap(input: SitemapInput): ToolResult<SitemapResult> {
    const startTime = performance.now();

    const { content } = input;

    if (!content || content.trim().length === 0) {
        return {
            success: false,
            error: 'Sitemap content is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Validate XML structure
    const validation = validateXmlStructure(content);

    // Extract URLs
    const urls = extractUrls(content);
    const lastModDates = extractLastModDates(content);

    // Determine if sitemap index or regular sitemap
    const isIndex = isSitemapIndex(content);

    // For sitemap index, URLs are nested sitemaps
    const nestedSitemaps = isIndex ? urls : [];
    const pageUrls = isIndex ? [] : urls;

    // Add warnings for common issues
    const warnings: string[] = [];

    if (urls.length === 0) {
        warnings.push('No URLs found in sitemap');
    }

    if (urls.length > 50000) {
        warnings.push(`Sitemap contains ${urls.length} URLs, exceeding the recommended maximum of 50,000`);
    }

    // Check for duplicate URLs
    const uniqueUrls = new Set(urls);
    if (uniqueUrls.size !== urls.length) {
        warnings.push(`Found ${urls.length - uniqueUrls.size} duplicate URLs`);
    }

    // Validate URL formats
    const invalidUrls: string[] = [];
    for (const url of urls) {
        try {
            new URL(url);
        } catch {
            invalidUrls.push(url);
        }
    }

    if (invalidUrls.length > 0) {
        warnings.push(`Found ${invalidUrls.length} invalid URL(s)`);
    }

    return {
        success: true,
        data: {
            isValid: validation.isValid,
            urlCount: urls.length,
            urls: pageUrls.slice(0, 100), // Limit to first 100 for performance
            nestedSitemaps,
            errors: validation.errors,
            lastModDates: lastModDates.slice(0, 100),
        },
        warnings: warnings.length > 0 ? warnings : undefined,
        processingTime: performance.now() - startTime,
    };
}

/**
 * Get sitemap statistics
 */
export function getSitemapStats(content: string): {
    totalUrls: number;
    uniqueUrls: number;
    duplicates: number;
    hasLastmod: boolean;
    hasPriority: boolean;
    hasChangefreq: boolean;
    isSitemapIndex: boolean;
} {
    const urls = extractUrls(content);
    const uniqueUrls = new Set(urls);

    return {
        totalUrls: urls.length,
        uniqueUrls: uniqueUrls.size,
        duplicates: urls.length - uniqueUrls.size,
        hasLastmod: /<lastmod>/i.test(content),
        hasPriority: /<priority>/i.test(content),
        hasChangefreq: /<changefreq>/i.test(content),
        isSitemapIndex: isSitemapIndex(content),
    };
}

/**
 * Generate a basic sitemap from URLs
 */
export function generateSitemap(urls: string[], options?: {
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}): string {
    const lines: string[] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    for (const url of urls) {
        lines.push('  <url>');
        lines.push(`    <loc>${escapeXml(url)}</loc>`);

        if (options?.lastmod) {
            lines.push(`    <lastmod>${options.lastmod}</lastmod>`);
        }

        if (options?.changefreq) {
            lines.push(`    <changefreq>${options.changefreq}</changefreq>`);
        }

        if (options?.priority !== undefined) {
            lines.push(`    <priority>${options.priority.toFixed(1)}</priority>`);
        }

        lines.push('  </url>');
    }

    lines.push('</urlset>');

    return lines.join('\n');
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

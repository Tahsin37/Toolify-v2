/**
 * Noindex / Nofollow Checker
 * 
 * Analyzes HTML for robots meta directives that affect indexing.
 */

import { extractTags, getMetaContent } from '@/lib/utils/html-parser';
import type { ToolResult, NoindexCheckResult, RobotsMetaTag } from '@/lib/types';

export interface NoindexCheckerInput {
    html: string;
    xRobotsTag?: string;
}

// Known robots directives
const ROBOTS_DIRECTIVES = [
    'index', 'noindex',
    'follow', 'nofollow',
    'archive', 'noarchive',
    'snippet', 'nosnippet',
    'noimageindex',
    'nocache',
    'none', 'all',
    'max-snippet',
    'max-image-preview',
    'max-video-preview',
    'notranslate',
    'noodp',
    'noydir',
    'unavailable_after',
];

/**
 * Parse robots meta content into directives
 */
function parseRobotsContent(content: string): string[] {
    if (!content) return [];

    return content
        .toLowerCase()
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);
}

/**
 * Check for noindex/nofollow directives
 */
export function checkNoindex(input: NoindexCheckerInput): ToolResult<NoindexCheckResult> {
    const startTime = performance.now();

    const { html, xRobotsTag } = input;

    if (!html || html.trim().length === 0) {
        return {
            success: false,
            error: 'HTML content is required',
            processingTime: performance.now() - startTime,
        };
    }

    const metaTags: RobotsMetaTag[] = [];
    const allDirectives: string[] = [];

    // Extract all meta tags with robots-related names
    const allMetaTags = extractTags(html, 'meta');

    for (const meta of allMetaTags) {
        const name = meta.attributes.name?.toLowerCase();
        const content = meta.attributes.content;

        // Check for robots meta tag
        if (name === 'robots' || name?.endsWith('bot') || name?.includes('robots')) {
            const directives = parseRobotsContent(content);
            metaTags.push({
                name: name,
                content: content || '',
                directives,
            });
            allDirectives.push(...directives);
        }
    }

    // Parse X-Robots-Tag if provided
    let xRobotsDirectives: string[] = [];
    if (xRobotsTag) {
        xRobotsDirectives = parseRobotsContent(xRobotsTag);
        allDirectives.push(...xRobotsDirectives);
    }

    // Determine status of each directive
    const hasNoindex = allDirectives.includes('noindex') || allDirectives.includes('none');
    const hasNofollow = allDirectives.includes('nofollow') || allDirectives.includes('none');
    const hasNoarchive = allDirectives.includes('noarchive') || allDirectives.includes('nocache');
    const hasNosnippet = allDirectives.includes('nosnippet');

    // Determine if page is indexable
    const isIndexable = !hasNoindex;

    // Generate summary
    const summary: string[] = [];

    if (metaTags.length === 0 && !xRobotsTag) {
        summary.push('No robots meta tags found - page allows full indexing by default');
    }

    if (hasNoindex) {
        summary.push('⛔ Page is set to NOINDEX - search engines will not index this page');
    } else {
        summary.push('✅ Page is indexable');
    }

    if (hasNofollow) {
        summary.push('⛔ Page is set to NOFOLLOW - links will not pass PageRank');
    } else if (!hasNoindex) {
        summary.push('✅ Links will be followed');
    }

    if (hasNoarchive) {
        summary.push('⚠️ NOARCHIVE is set - cached version will not be available');
    }

    if (hasNosnippet) {
        summary.push('⚠️ NOSNIPPET is set - no snippet will show in search results');
    }

    if (xRobotsTag) {
        summary.push(`📋 X-Robots-Tag header detected: ${xRobotsTag}`);
    }

    // Check for conflicting directives
    if (allDirectives.includes('index') && allDirectives.includes('noindex')) {
        summary.push('⚠️ Conflicting directives: both INDEX and NOINDEX found');
    }

    if (allDirectives.includes('follow') && allDirectives.includes('nofollow')) {
        summary.push('⚠️ Conflicting directives: both FOLLOW and NOFOLLOW found');
    }

    return {
        success: true,
        data: {
            hasNoindex,
            hasNofollow,
            hasNoarchive,
            hasNosnippet,
            metaTags,
            xRobotsTag: xRobotsTag || null,
            summary,
            isIndexable,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Generate robots meta tag HTML
 */
export function generateRobotsMetaTag(options: {
    index?: boolean;
    follow?: boolean;
    archive?: boolean;
    snippet?: boolean;
}): string {
    const directives: string[] = [];

    if (options.index === false) {
        directives.push('noindex');
    }

    if (options.follow === false) {
        directives.push('nofollow');
    }

    if (options.archive === false) {
        directives.push('noarchive');
    }

    if (options.snippet === false) {
        directives.push('nosnippet');
    }

    if (directives.length === 0) {
        return '<meta name="robots" content="index, follow" />';
    }

    return `<meta name="robots" content="${directives.join(', ')}" />`;
}

/**
 * Get indexability status from HTML
 */
export function isPageIndexable(html: string): boolean {
    const result = checkNoindex({ html });
    return result.success && result.data?.isIndexable === true;
}

/**
 * Get all robots directives from HTML
 */
export function getAllRobotsDirectives(html: string): string[] {
    const result = checkNoindex({ html });

    if (!result.success || !result.data) {
        return [];
    }

    const directives: string[] = [];

    for (const meta of result.data.metaTags) {
        directives.push(...meta.directives);
    }

    if (result.data.xRobotsTag) {
        directives.push(...parseRobotsContent(result.data.xRobotsTag));
    }

    return [...new Set(directives)];
}

/**
 * Explain a robots directive
 */
export function explainDirective(directive: string): string {
    const explanations: Record<string, string> = {
        'index': 'Allow search engines to index this page',
        'noindex': 'Prevent search engines from indexing this page',
        'follow': 'Allow search engines to follow links on this page',
        'nofollow': 'Prevent search engines from following links on this page',
        'archive': 'Allow cached versions of this page',
        'noarchive': 'Prevent cached versions of this page',
        'snippet': 'Allow snippets in search results',
        'nosnippet': 'Prevent snippets in search results',
        'noimageindex': 'Prevent images on this page from being indexed',
        'none': 'Equivalent to noindex, nofollow',
        'all': 'Equivalent to index, follow (default)',
        'notranslate': 'Prevent translation of this page in search results',
        'nocache': 'Same as noarchive',
    };

    return explanations[directive.toLowerCase()] || 'Unknown directive';
}

/**
 * Robots.txt Validator
 * 
 * Parses and validates robots.txt files according to the 
 * Robots Exclusion Protocol specification.
 */

import type { ToolResult, RobotsTxtResult, RobotsTxtDirective } from '@/lib/types';

export interface RobotsTxtInput {
    content: string;
}

// Valid directive types
const VALID_DIRECTIVES = [
    'user-agent',
    'disallow',
    'allow',
    'sitemap',
    'crawl-delay',
    'host',
];

/**
 * Parse a single line of robots.txt
 */
function parseLine(line: string, lineNumber: number): RobotsTxtDirective | null {
    // Skip empty lines and comments
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
        return null;
    }

    // Remove inline comments
    const withoutComment = trimmedLine.split('#')[0].trim();

    // Parse directive
    const colonIndex = withoutComment.indexOf(':');
    if (colonIndex === -1) {
        return {
            type: 'unknown',
            value: withoutComment,
            lineNumber,
            isValid: false,
            error: 'Invalid directive format. Expected "Directive: Value"',
        };
    }

    const directiveName = withoutComment.slice(0, colonIndex).trim().toLowerCase();
    const directiveValue = withoutComment.slice(colonIndex + 1).trim();

    // Check if directive is known
    const type = VALID_DIRECTIVES.includes(directiveName)
        ? directiveName as RobotsTxtDirective['type']
        : 'unknown';

    // Validate specific directives
    let isValid = true;
    let error: string | undefined;

    if (type === 'unknown') {
        isValid = false;
        error = `Unknown directive: "${directiveName}"`;
    } else if (type === 'user-agent' && !directiveValue) {
        isValid = false;
        error = 'User-agent value cannot be empty';
    } else if (type === 'crawl-delay') {
        const delay = parseFloat(directiveValue);
        if (isNaN(delay) || delay < 0) {
            isValid = false;
            error = 'Crawl-delay must be a positive number';
        }
    } else if (type === 'sitemap') {
        try {
            new URL(directiveValue);
        } catch {
            isValid = false;
            error = 'Sitemap must be a valid URL';
        }
    }

    return {
        type,
        value: directiveValue,
        lineNumber,
        isValid,
        error,
    };
}

/**
 * Validate robots.txt content
 */
export function validateRobotsTxt(input: RobotsTxtInput): ToolResult<RobotsTxtResult> {
    const startTime = performance.now();

    const { content } = input;

    if (!content || content.trim().length === 0) {
        return {
            success: true,
            data: {
                isValid: true,
                directives: [],
                userAgents: [],
                sitemaps: [],
                errors: [],
                warnings: ['Empty robots.txt file - all crawlers will have full access'],
            },
            processingTime: performance.now() - startTime,
        };
    }

    const lines = content.split('\n');
    const directives: RobotsTxtDirective[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    const userAgents: Set<string> = new Set();
    const sitemaps: Set<string> = new Set();

    let hasUserAgent = false;
    let currentUserAgent: string | null = null;

    for (let i = 0; i < lines.length; i++) {
        const directive = parseLine(lines[i], i + 1);

        if (!directive) continue;

        directives.push(directive);

        if (!directive.isValid && directive.error) {
            errors.push(`Line ${directive.lineNumber}: ${directive.error}`);
        }

        // Track state
        if (directive.type === 'user-agent') {
            hasUserAgent = true;
            currentUserAgent = directive.value;
            userAgents.add(directive.value);
        } else if (directive.type === 'sitemap') {
            sitemaps.add(directive.value);
        } else if ((directive.type === 'disallow' || directive.type === 'allow') && !currentUserAgent) {
            warnings.push(`Line ${directive.lineNumber}: ${directive.type} before any User-agent declaration`);
        }
    }

    // Additional validation
    if (!hasUserAgent && directives.length > 0) {
        warnings.push('No User-agent directive found');
    }

    if (sitemaps.size === 0) {
        warnings.push('No Sitemap directive found - consider adding one for better crawling');
    }

    // Check for wildcard user-agent
    if (!userAgents.has('*')) {
        warnings.push('No wildcard User-agent (*) found - some crawlers may not be covered');
    }

    const isValid = errors.length === 0;

    return {
        success: true,
        data: {
            isValid,
            directives,
            userAgents: Array.from(userAgents),
            sitemaps: Array.from(sitemaps),
            errors,
            warnings,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Generate a basic robots.txt template
 */
export function generateRobotsTxtTemplate(options: {
    allowAll?: boolean;
    disallowPaths?: string[];
    sitemapUrl?: string;
}): string {
    const lines: string[] = [];

    lines.push('User-agent: *');

    if (options.allowAll) {
        lines.push('Allow: /');
    } else if (options.disallowPaths && options.disallowPaths.length > 0) {
        for (const path of options.disallowPaths) {
            lines.push(`Disallow: ${path}`);
        }
    } else {
        lines.push('Disallow:');
    }

    if (options.sitemapUrl) {
        lines.push('');
        lines.push(`Sitemap: ${options.sitemapUrl}`);
    }

    return lines.join('\n');
}

/**
 * Check if a URL is allowed for a specific user-agent
 */
export function isUrlAllowed(
    robotsTxt: string,
    url: string,
    userAgent: string = '*'
): boolean {
    const result = validateRobotsTxt({ content: robotsTxt });

    if (!result.success || !result.data) {
        return true; // Default to allowed if parsing fails
    }

    const { directives } = result.data;

    // Find applicable rules for the user-agent
    let applicableRules: RobotsTxtDirective[] = [];
    let inApplicableSection = false;

    for (const directive of directives) {
        if (directive.type === 'user-agent') {
            inApplicableSection = directive.value === userAgent || directive.value === '*';
        } else if (inApplicableSection && (directive.type === 'allow' || directive.type === 'disallow')) {
            applicableRules.push(directive);
        }
    }

    // Check rules (more specific rules take precedence)
    try {
        const urlPath = new URL(url).pathname;

        // Sort by specificity (longer patterns first)
        applicableRules = applicableRules.sort((a, b) => b.value.length - a.value.length);

        for (const rule of applicableRules) {
            if (urlPath.startsWith(rule.value) || rule.value === '') {
                return rule.type === 'allow';
            }
        }
    } catch {
        // Invalid URL, default to allowed
    }

    return true; // Default to allowed
}

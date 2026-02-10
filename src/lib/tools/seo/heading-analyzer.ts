/**
 * H1-H6 Heading Structure Analyzer
 * 
 * Analyzes heading hierarchy in HTML for SEO best practices.
 */

import { extractHeadings } from '@/lib/utils/html-parser';
import type { ToolResult, HeadingAnalysisResult, HeadingItem, HeadingHierarchy } from '@/lib/types';

export interface HeadingAnalyzerInput {
    html: string;
}

/**
 * Build hierarchical structure from flat heading list
 */
function buildHierarchy(headings: HeadingItem[]): HeadingHierarchy[] {
    const result: HeadingHierarchy[] = [];
    const stack: HeadingHierarchy[] = [];

    for (const heading of headings) {
        const item: HeadingHierarchy = {
            level: heading.level,
            text: heading.text,
            children: [],
        };

        // Find parent level
        while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
            stack.pop();
        }

        if (stack.length === 0) {
            result.push(item);
        } else {
            stack[stack.length - 1].children.push(item);
        }

        stack.push(item);
    }

    return result;
}

/**
 * Generate structure visualization
 */
function generateStructureVisualization(headings: HeadingItem[]): string[] {
    return headings.map(h => {
        const indent = '  '.repeat(h.level - 1);
        return `${indent}H${h.level}: ${h.text}`;
    });
}

/**
 * Analyze heading structure
 */
export function analyzeHeadings(input: HeadingAnalyzerInput): ToolResult<HeadingAnalysisResult> {
    const startTime = performance.now();

    const { html } = input;

    if (!html || html.trim().length === 0) {
        return {
            success: false,
            error: 'HTML content is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Extract headings
    const headings = extractHeadings(html);

    // Analyze structure
    const issues: string[] = [];

    // Count H1s
    const h1Count = headings.filter(h => h.level === 1).length;
    const hasH1 = h1Count > 0;

    // Check for common issues
    if (!hasH1) {
        issues.push('No H1 tag found - every page should have exactly one H1');
    } else if (h1Count > 1) {
        issues.push(`Multiple H1 tags found (${h1Count}) - consider using only one H1 per page`);
    }

    // Check for skipped levels
    if (headings.length > 0) {
        // Check if first heading is not H1
        if (headings[0].level !== 1) {
            issues.push(`First heading is H${headings[0].level} - consider starting with H1`);
        }

        // Check for skipped levels
        for (let i = 1; i < headings.length; i++) {
            const currentLevel = headings[i].level;
            const previousLevel = headings[i - 1].level;

            // Only check if going deeper (smaller to larger number)
            if (currentLevel > previousLevel && currentLevel - previousLevel > 1) {
                issues.push(
                    `Skipped heading level: H${previousLevel} to H${currentLevel} ` +
                    `(at "${headings[i].text.substring(0, 30)}...")`
                );
            }
        }
    }

    // Check for empty headings
    const emptyHeadings = headings.filter(h => !h.text.trim());
    if (emptyHeadings.length > 0) {
        issues.push(`Found ${emptyHeadings.length} empty heading(s)`);
    }

    // Check for very long headings
    const longHeadings = headings.filter(h => h.text.length > 70);
    if (longHeadings.length > 0) {
        issues.push(`Found ${longHeadings.length} heading(s) longer than 70 characters`);
    }

    // Check for duplicate headings at same level
    const headingsByLevel = new Map<number, string[]>();
    for (const h of headings) {
        const existing = headingsByLevel.get(h.level) || [];
        if (existing.includes(h.text.toLowerCase())) {
            issues.push(`Duplicate H${h.level} heading: "${h.text}"`);
        }
        existing.push(h.text.toLowerCase());
        headingsByLevel.set(h.level, existing);
    }

    // Build visualization and hierarchy
    const structure = generateStructureVisualization(headings);
    const hierarchy = buildHierarchy(headings);

    return {
        success: true,
        data: {
            headings,
            structure,
            hasH1,
            h1Count,
            issues,
            hierarchy,
        },
        warnings: issues.length > 0 ? issues : undefined,
        processingTime: performance.now() - startTime,
    };
}

/**
 * Get heading statistics
 */
export function getHeadingStats(html: string): {
    total: number;
    byLevel: Record<number, number>;
    averageLength: number;
    longestHeading: string;
    shortestHeading: string;
} {
    const headings = extractHeadings(html);

    const byLevel: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    let totalLength = 0;
    let longestHeading = '';
    let shortestHeading = headings[0]?.text || '';

    for (const h of headings) {
        byLevel[h.level] = (byLevel[h.level] || 0) + 1;
        totalLength += h.text.length;

        if (h.text.length > longestHeading.length) {
            longestHeading = h.text;
        }
        if (h.text.length < shortestHeading.length) {
            shortestHeading = h.text;
        }
    }

    return {
        total: headings.length,
        byLevel,
        averageLength: headings.length > 0 ? Math.round(totalLength / headings.length) : 0,
        longestHeading,
        shortestHeading,
    };
}

/**
 * Suggest optimal heading structure
 */
export function suggestHeadingStructure(topic: string): string[] {
    return [
        `H1: ${topic}`,
        `  H2: What is ${topic}?`,
        `  H2: Benefits of ${topic}`,
        `    H3: Key Advantage 1`,
        `    H3: Key Advantage 2`,
        `  H2: How to Use ${topic}`,
        `    H3: Step 1`,
        `    H3: Step 2`,
        `  H2: FAQ`,
        `    H3: Common Question 1`,
        `    H3: Common Question 2`,
    ];
}

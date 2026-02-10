/**
 * Regex Tester
 * 
 * Tests regular expressions against text with match highlighting.
 */

import type { ToolResult, RegexTestResult, RegexMatch } from '@/lib/types';

export interface RegexTesterInput {
    pattern: string;
    testString: string;
    flags?: string;
}

/**
 * Test regex pattern against text
 */
export function testRegex(input: RegexTesterInput): ToolResult<RegexTestResult> {
    const startTime = performance.now();

    const { pattern, testString, flags = 'g' } = input;

    if (!pattern) {
        return {
            success: false,
            error: 'Pattern is required',
            processingTime: performance.now() - startTime,
        };
    }

    if (testString === undefined || testString === null) {
        return {
            success: false,
            error: 'Test string is required',
            processingTime: performance.now() - startTime,
        };
    }

    try {
        const regex = new RegExp(pattern, flags);
        const matches: RegexMatch[] = [];

        // Handle global flag
        if (flags.includes('g')) {
            let match;
            while ((match = regex.exec(testString)) !== null) {
                const regexMatch: RegexMatch = {
                    match: match[0],
                    index: match.index,
                };

                // Add named groups if present
                if (match.groups) {
                    regexMatch.groups = match.groups;
                }

                matches.push(regexMatch);

                // Prevent infinite loop for zero-length matches
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }
            }
        } else {
            // Non-global: single match
            const match = regex.exec(testString);
            if (match) {
                const regexMatch: RegexMatch = {
                    match: match[0],
                    index: match.index,
                };

                if (match.groups) {
                    regexMatch.groups = match.groups;
                }

                matches.push(regexMatch);
            }
        }

        return {
            success: true,
            data: {
                isValid: true,
                pattern,
                flags,
                matches,
                matchCount: matches.length,
                testString,
            },
            processingTime: performance.now() - startTime,
        };
    } catch (e) {
        return {
            success: true,
            data: {
                isValid: false,
                pattern,
                flags,
                matches: [],
                matchCount: 0,
                error: (e as Error).message,
                testString,
            },
            processingTime: performance.now() - startTime,
        };
    }
}

/**
 * Validate regex pattern
 */
export function validateRegex(pattern: string, flags: string = ''): {
    isValid: boolean;
    error?: string;
} {
    try {
        new RegExp(pattern, flags);
        return { isValid: true };
    } catch (e) {
        return {
            isValid: false,
            error: (e as Error).message,
        };
    }
}

/**
 * Replace using regex
 */
export function regexReplace(
    text: string,
    pattern: string,
    replacement: string,
    flags: string = 'g'
): ToolResult<{ result: string; replacements: number }> {
    try {
        const regex = new RegExp(pattern, flags);

        // Count replacements
        let replacements = 0;
        const result = text.replace(regex, (...args) => {
            replacements++;

            // Handle replacement patterns like $1, $2, etc.
            let replaced = replacement;

            // Named groups
            const groups = args[args.length - 1];
            if (typeof groups === 'object' && groups !== null) {
                for (const [name, value] of Object.entries(groups)) {
                    replaced = replaced.replace(new RegExp(`\\$<${name}>`, 'g'), value as string);
                }
            }

            // Numbered groups
            for (let i = 1; i < args.length - 2; i++) {
                if (args[i] !== undefined) {
                    replaced = replaced.replace(new RegExp(`\\$${i}`, 'g'), args[i]);
                }
            }

            // Full match
            replaced = replaced.replace(/\$&/g, args[0]);

            return replaced;
        });

        return {
            success: true,
            data: { result, replacements },
        };
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message,
        };
    }
}

/**
 * Split using regex
 */
export function regexSplit(
    text: string,
    pattern: string,
    flags: string = ''
): ToolResult<string[]> {
    try {
        const regex = new RegExp(pattern, flags);
        return {
            success: true,
            data: text.split(regex),
        };
    } catch (e) {
        return {
            success: false,
            error: (e as Error).message,
        };
    }
}

/**
 * Escape special regex characters in a string
 */
export function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Generate regex from examples
 */
export function generateRegexFromExamples(examples: string[]): string {
    if (examples.length === 0) return '';
    if (examples.length === 1) return escapeRegex(examples[0]);

    // Find common patterns
    const escaped = examples.map(escapeRegex);

    // Simple approach: alternation
    return `(?:${escaped.join('|')})`;
}

/**
 * Get common regex patterns
 */
export function getCommonPatterns(): Record<string, { pattern: string; description: string }> {
    return {
        email: {
            pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
            description: 'Email address',
        },
        url: {
            pattern: 'https?:\\/\\/[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+',
            description: 'URL with http(s)',
        },
        phone: {
            pattern: '\\+?[\\d\\s\\-().]{10,}',
            description: 'Phone number',
        },
        ipv4: {
            pattern: '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}',
            description: 'IPv4 address',
        },
        date: {
            pattern: '\\d{4}[-/]\\d{2}[-/]\\d{2}',
            description: 'Date (YYYY-MM-DD)',
        },
        time: {
            pattern: '\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?[AP]M)?',
            description: 'Time (HH:MM)',
        },
        hexColor: {
            pattern: '#(?:[0-9a-fA-F]{3}){1,2}',
            description: 'Hex color code',
        },
        htmlTag: {
            pattern: '<[^>]+>',
            description: 'HTML tag',
        },
        number: {
            pattern: '-?\\d+(?:\\.\\d+)?',
            description: 'Number (integer or decimal)',
        },
        word: {
            pattern: '\\b\\w+\\b',
            description: 'Word',
        },
    };
}

/**
 * Explain regex flags
 */
export function explainFlags(flags: string): string[] {
    const explanations: Record<string, string> = {
        g: 'Global - find all matches',
        i: 'Case-insensitive',
        m: 'Multiline - ^ and $ match line boundaries',
        s: 'Dotall - . matches newlines',
        u: 'Unicode - treat pattern as Unicode',
        y: 'Sticky - match from lastIndex only',
        d: 'Indices - generate match indices',
    };

    return flags.split('').map(flag => explanations[flag] || `Unknown flag: ${flag}`);
}

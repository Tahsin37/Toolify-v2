/**
 * Whitespace Cleaner
 * 
 * Removes and normalizes various types of whitespace.
 */

import type { ToolResult, WhitespaceCleanResult } from '@/lib/types';

export interface WhitespaceCleanerInput {
    text: string;
    options?: {
        trimLines?: boolean;
        removeExtraSpaces?: boolean;
        removeExtraNewlines?: boolean;
        removeLeadingWhitespace?: boolean;
        removeTrailingWhitespace?: boolean;
        normalizeLineEndings?: boolean;
        removeTabs?: boolean;
        removeAllWhitespace?: boolean;
    };
}

/**
 * Clean whitespace from text
 */
export function cleanWhitespace(input: WhitespaceCleanerInput): ToolResult<WhitespaceCleanResult> {
    const startTime = performance.now();

    const { text, options = {} } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    const {
        trimLines = true,
        removeExtraSpaces = true,
        removeExtraNewlines = true,
        removeLeadingWhitespace = false,
        removeTrailingWhitespace = false,
        normalizeLineEndings = true,
        removeTabs = false,
        removeAllWhitespace = false,
    } = options;

    let cleaned = text;
    const changesApplied: string[] = [];

    // If removeAllWhitespace is true, remove everything and return
    if (removeAllWhitespace) {
        cleaned = cleaned.replace(/\s+/g, '');
        changesApplied.push('Removed all whitespace');

        return {
            success: true,
            data: {
                original: text,
                cleaned,
                changesApplied,
                charactersSaved: text.length - cleaned.length,
            },
            processingTime: performance.now() - startTime,
        };
    }

    // Normalize line endings first (CRLF and CR to LF)
    if (normalizeLineEndings) {
        const before = cleaned;
        cleaned = cleaned.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        if (cleaned !== before) {
            changesApplied.push('Normalized line endings');
        }
    }

    // Remove tabs (convert to spaces or remove entirely)
    if (removeTabs) {
        const before = cleaned;
        cleaned = cleaned.replace(/\t/g, '');
        if (cleaned !== before) {
            changesApplied.push('Removed tabs');
        }
    }

    // Remove extra spaces (multiple spaces to single)
    if (removeExtraSpaces) {
        const before = cleaned;
        cleaned = cleaned.replace(/[ \t]+/g, ' ');
        if (cleaned !== before) {
            changesApplied.push('Removed extra spaces');
        }
    }

    // Trim lines
    if (trimLines) {
        const before = cleaned;
        cleaned = cleaned
            .split('\n')
            .map(line => line.trim())
            .join('\n');
        if (cleaned !== before) {
            changesApplied.push('Trimmed lines');
        }
    }

    // Remove extra newlines (more than 2 consecutive)
    if (removeExtraNewlines) {
        const before = cleaned;
        cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
        if (cleaned !== before) {
            changesApplied.push('Removed extra newlines');
        }
    }

    // Remove leading whitespace from entire text
    if (removeLeadingWhitespace) {
        const before = cleaned;
        cleaned = cleaned.replace(/^\s+/, '');
        if (cleaned !== before) {
            changesApplied.push('Removed leading whitespace');
        }
    }

    // Remove trailing whitespace from entire text
    if (removeTrailingWhitespace) {
        const before = cleaned;
        cleaned = cleaned.replace(/\s+$/, '');
        if (cleaned !== before) {
            changesApplied.push('Removed trailing whitespace');
        }
    }

    return {
        success: true,
        data: {
            original: text,
            cleaned,
            changesApplied,
            charactersSaved: text.length - cleaned.length,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Analyze whitespace in text
 */
export function analyzeWhitespace(text: string): {
    spaces: number;
    tabs: number;
    newlines: number;
    carriageReturns: number;
    emptyLines: number;
    leadingWhitespace: number;
    trailingWhitespace: number;
    consecutiveSpaces: number;
    totalWhitespace: number;
    whitespacePercentage: number;
} {
    const spaces = (text.match(/ /g) || []).length;
    const tabs = (text.match(/\t/g) || []).length;
    const newlines = (text.match(/\n/g) || []).length;
    const carriageReturns = (text.match(/\r/g) || []).length;

    // Count empty lines
    const lines = text.split('\n');
    const emptyLines = lines.filter(line => line.trim() === '').length;

    // Leading whitespace
    const leadingMatch = text.match(/^\s+/);
    const leadingWhitespace = leadingMatch ? leadingMatch[0].length : 0;

    // Trailing whitespace
    const trailingMatch = text.match(/\s+$/);
    const trailingWhitespace = trailingMatch ? trailingMatch[0].length : 0;

    // Consecutive spaces (2 or more)
    const consecutiveMatches = text.match(/ {2,}/g) || [];
    const consecutiveSpaces = consecutiveMatches.reduce((sum, match) => sum + match.length, 0);

    const totalWhitespace = spaces + tabs + newlines + carriageReturns;
    const whitespacePercentage = text.length > 0
        ? Math.round((totalWhitespace / text.length) * 100)
        : 0;

    return {
        spaces,
        tabs,
        newlines,
        carriageReturns,
        emptyLines,
        leadingWhitespace,
        trailingWhitespace,
        consecutiveSpaces,
        totalWhitespace,
        whitespacePercentage,
    };
}

/**
 * Convert tabs to spaces
 */
export function tabsToSpaces(text: string, tabSize: number = 2): string {
    return text.replace(/\t/g, ' '.repeat(tabSize));
}

/**
 * Convert spaces to tabs
 */
export function spacesToTabs(text: string, tabSize: number = 2): string {
    const pattern = new RegExp(` {${tabSize}}`, 'g');
    return text.replace(pattern, '\t');
}

/**
 * Remove all blank lines
 */
export function removeBlankLines(text: string): string {
    return text
        .split('\n')
        .filter(line => line.trim() !== '')
        .join('\n');
}

/**
 * Collapse multiple blank lines to single
 */
export function collapseBlankLines(text: string): string {
    return text.replace(/\n\s*\n/g, '\n\n');
}

/**
 * Add consistent indentation
 */
export function indent(text: string, spaces: number = 2): string {
    const indentation = ' '.repeat(spaces);
    return text
        .split('\n')
        .map(line => indentation + line)
        .join('\n');
}

/**
 * Remove indentation
 */
export function unindent(text: string): string {
    const lines = text.split('\n');

    // Find minimum indentation (excluding empty lines)
    let minIndent = Infinity;
    for (const line of lines) {
        if (line.trim() === '') continue;
        const match = line.match(/^(\s*)/);
        if (match && match[1].length < minIndent) {
            minIndent = match[1].length;
        }
    }

    if (minIndent === Infinity || minIndent === 0) {
        return text;
    }

    // Remove minimum indentation from all lines
    return lines
        .map(line => line.slice(minIndent))
        .join('\n');
}

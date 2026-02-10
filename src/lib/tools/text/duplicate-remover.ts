/**
 * Remove Duplicate Lines
 * 
 * Removes duplicate lines from text content.
 */

import type { ToolResult, DuplicateRemoveResult } from '@/lib/types';

export interface DuplicateRemoverInput {
    text: string;
    caseSensitive?: boolean;
    trimLines?: boolean;
    preserveOrder?: boolean;
}

/**
 * Remove duplicate lines from text
 */
export function removeDuplicateLines(input: DuplicateRemoverInput): ToolResult<DuplicateRemoveResult> {
    const startTime = performance.now();

    const {
        text,
        caseSensitive = true,
        trimLines = true,
        preserveOrder = true
    } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Split into lines
    const lines = text.split('\n');
    const originalLineCount = lines.length;

    // Track seen lines and duplicates
    const seen = new Map<string, number>();
    const duplicateLines: string[] = [];
    const uniqueLines: string[] = [];

    for (const line of lines) {
        // Process line for comparison
        const processedLine = trimLines ? line.trim() : line;
        const compareKey = caseSensitive ? processedLine : processedLine.toLowerCase();

        const count = seen.get(compareKey) || 0;

        if (count === 0) {
            // First occurrence - keep it
            uniqueLines.push(processedLine);
            seen.set(compareKey, 1);
        } else {
            // Duplicate
            if (count === 1) {
                // First duplicate - add to duplicates list
                duplicateLines.push(processedLine);
            }
            seen.set(compareKey, count + 1);
        }
    }

    // Build result
    const cleaned = uniqueLines.join('\n');
    const uniqueLineCount = uniqueLines.length;
    const duplicatesRemoved = originalLineCount - uniqueLineCount;

    return {
        success: true,
        data: {
            original: text,
            cleaned,
            originalLineCount,
            uniqueLineCount,
            duplicatesRemoved,
            duplicateLines: [...new Set(duplicateLines)],
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Find all duplicates with their counts
 */
export function findDuplicates(text: string, caseSensitive: boolean = true): Array<{
    line: string;
    count: number;
    firstOccurrence: number;
}> {
    const lines = text.split('\n');
    const counts = new Map<string, { original: string; count: number; firstIndex: number }>();

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        const key = caseSensitive ? trimmed : trimmed.toLowerCase();

        if (counts.has(key)) {
            const existing = counts.get(key)!;
            existing.count++;
        } else {
            counts.set(key, { original: trimmed, count: 1, firstIndex: index + 1 });
        }
    });

    return Array.from(counts.values())
        .filter(item => item.count > 1)
        .map(item => ({
            line: item.original,
            count: item.count,
            firstOccurrence: item.firstIndex,
        }))
        .sort((a, b) => b.count - a.count);
}

/**
 * Get line frequency statistics
 */
export function getLineFrequency(text: string): {
    totalLines: number;
    uniqueLines: number;
    duplicateLines: number;
    emptyLines: number;
    duplicatePercentage: number;
} {
    const lines = text.split('\n');
    const totalLines = lines.length;
    const emptyLines = lines.filter(line => line.trim() === '').length;
    const uniqueSet = new Set(lines.map(line => line.trim()));
    const uniqueLines = uniqueSet.size;
    const duplicateLines = totalLines - uniqueLines;
    const duplicatePercentage = totalLines > 0
        ? Math.round((duplicateLines / totalLines) * 100)
        : 0;

    return {
        totalLines,
        uniqueLines,
        duplicateLines,
        emptyLines,
        duplicatePercentage,
    };
}

/**
 * Remove empty lines
 */
export function removeEmptyLines(text: string): string {
    return text
        .split('\n')
        .filter(line => line.trim() !== '')
        .join('\n');
}

/**
 * Sort lines
 */
export function sortLines(
    text: string,
    options?: {
        ascending?: boolean;
        caseSensitive?: boolean;
        numeric?: boolean;
    }
): string {
    const { ascending = true, caseSensitive = true, numeric = false } = options || {};

    const lines = text.split('\n');

    lines.sort((a, b) => {
        let compareA = caseSensitive ? a : a.toLowerCase();
        let compareB = caseSensitive ? b : b.toLowerCase();

        if (numeric) {
            const numA = parseFloat(compareA) || 0;
            const numB = parseFloat(compareB) || 0;
            return ascending ? numA - numB : numB - numA;
        }

        const result = compareA.localeCompare(compareB);
        return ascending ? result : -result;
    });

    return lines.join('\n');
}

/**
 * Reverse lines
 */
export function reverseLines(text: string): string {
    return text.split('\n').reverse().join('\n');
}

/**
 * Shuffle lines randomly
 */
export function shuffleLines(text: string): string {
    const lines = text.split('\n');

    // Fisher-Yates shuffle
    for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
    }

    return lines.join('\n');
}

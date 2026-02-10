/**
 * Text Diff Checker
 * 
 * Compares two texts and shows differences.
 */

import { calculateSimilarity } from '@/lib/utils/text-analysis';
import type { ToolResult, TextDiffResult, DiffChange } from '@/lib/types';

export interface TextDiffInput {
    original: string;
    modified: string;
    ignoreWhitespace?: boolean;
    ignoreCase?: boolean;
}

/**
 * Compare two texts and return differences
 */
export function compareTexts(input: TextDiffInput): ToolResult<TextDiffResult> {
    const startTime = performance.now();

    const { original, modified, ignoreWhitespace = false, ignoreCase = false } = input;

    if (original === undefined || modified === undefined) {
        return {
            success: false,
            error: 'Both original and modified texts are required',
            processingTime: performance.now() - startTime,
        };
    }

    // Preprocess texts if needed
    let processedOriginal = original;
    let processedModified = modified;

    if (ignoreWhitespace) {
        processedOriginal = processedOriginal.replace(/\s+/g, ' ').trim();
        processedModified = processedModified.replace(/\s+/g, ' ').trim();
    }

    if (ignoreCase) {
        processedOriginal = processedOriginal.toLowerCase();
        processedModified = processedModified.toLowerCase();
    }

    // Split into lines
    const originalLines = processedOriginal.split('\n');
    const modifiedLines = processedModified.split('\n');

    // Perform line-by-line diff
    const changes = computeLineDiff(originalLines, modifiedLines);

    // Count changes
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    for (const change of changes) {
        switch (change.type) {
            case 'added':
                additions++;
                break;
            case 'removed':
                deletions++;
                break;
            case 'unchanged':
                unchanged++;
                break;
        }
    }

    // Calculate similarity
    const similarity = calculateSimilarity(processedOriginal, processedModified);

    return {
        success: true,
        data: {
            original,
            modified,
            changes,
            additions,
            deletions,
            unchanged,
            similarity,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Compute line-by-line diff using LCS algorithm
 */
function computeLineDiff(original: string[], modified: string[]): DiffChange[] {
    const m = original.length;
    const n = modified.length;

    // Build LCS table
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (original[i - 1] === modified[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }

    // Backtrack to build diff
    const changes: DiffChange[] = [];
    let i = m;
    let j = n;

    const tempChanges: DiffChange[] = [];

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
            tempChanges.push({
                type: 'unchanged',
                value: original[i - 1],
                lineNumber: i,
            });
            i--;
            j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
            tempChanges.push({
                type: 'added',
                value: modified[j - 1],
                lineNumber: j,
            });
            j--;
        } else {
            tempChanges.push({
                type: 'removed',
                value: original[i - 1],
                lineNumber: i,
            });
            i--;
        }
    }

    // Reverse to get correct order
    return tempChanges.reverse();
}

/**
 * Get word-level diff
 */
export function compareWords(original: string, modified: string): DiffChange[] {
    const originalWords = original.split(/(\s+)/);
    const modifiedWords = modified.split(/(\s+)/);

    return computeLineDiff(originalWords, modifiedWords);
}

/**
 * Get character-level diff
 */
export function compareCharacters(original: string, modified: string): DiffChange[] {
    const originalChars = original.split('');
    const modifiedChars = modified.split('');

    return computeLineDiff(originalChars, modifiedChars);
}

/**
 * Generate unified diff format
 */
export function generateUnifiedDiff(
    original: string[],
    modified: string[],
    originalName: string = 'original',
    modifiedName: string = 'modified'
): string {
    const changes = computeLineDiff(original, modified);
    const lines: string[] = [];

    lines.push(`--- ${originalName}`);
    lines.push(`+++ ${modifiedName}`);

    let currentChunk: string[] = [];
    let chunkStartOriginal = 1;
    let chunkStartModified = 1;
    let originalCount = 0;
    let modifiedCount = 0;
    let originalLine = 0;
    let modifiedLine = 0;

    for (const change of changes) {
        switch (change.type) {
            case 'unchanged':
                if (currentChunk.length > 0) {
                    // Flush current chunk
                    lines.push(`@@ -${chunkStartOriginal},${originalCount} +${chunkStartModified},${modifiedCount} @@`);
                    lines.push(...currentChunk);
                    currentChunk = [];
                    originalCount = 0;
                    modifiedCount = 0;
                }
                originalLine++;
                modifiedLine++;
                chunkStartOriginal = originalLine + 1;
                chunkStartModified = modifiedLine + 1;
                break;
            case 'removed':
                if (currentChunk.length === 0) {
                    chunkStartOriginal = originalLine + 1;
                    chunkStartModified = modifiedLine + 1;
                }
                currentChunk.push(`-${change.value}`);
                originalCount++;
                originalLine++;
                break;
            case 'added':
                if (currentChunk.length === 0) {
                    chunkStartOriginal = originalLine + 1;
                    chunkStartModified = modifiedLine + 1;
                }
                currentChunk.push(`+${change.value}`);
                modifiedCount++;
                modifiedLine++;
                break;
        }
    }

    if (currentChunk.length > 0) {
        lines.push(`@@ -${chunkStartOriginal},${originalCount} +${chunkStartModified},${modifiedCount} @@`);
        lines.push(...currentChunk);
    }

    return lines.join('\n');
}

/**
 * Get diff statistics
 */
export function getDiffStats(original: string, modified: string): {
    linesAdded: number;
    linesRemoved: number;
    linesChanged: number;
    similarity: number;
    isIdentical: boolean;
} {
    const result = compareTexts({ original, modified });

    if (!result.success || !result.data) {
        return {
            linesAdded: 0,
            linesRemoved: 0,
            linesChanged: 0,
            similarity: 0,
            isIdentical: false,
        };
    }

    return {
        linesAdded: result.data.additions,
        linesRemoved: result.data.deletions,
        linesChanged: result.data.additions + result.data.deletions,
        similarity: result.data.similarity,
        isIdentical: result.data.additions === 0 && result.data.deletions === 0,
    };
}

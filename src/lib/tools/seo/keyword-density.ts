/**
 * Keyword Density Checker
 * 
 * Analyzes text for keyword frequency and density percentages.
 */

import {
    countWords,
    getWordFrequency,
    getNGramFrequency,
    calculateKeywordDensity,
    STOP_WORDS
} from '@/lib/utils/text-analysis';
import { stripHtml } from '@/lib/utils/html-parser';
import type { ToolResult, KeywordDensityResult, KeywordDensityItem } from '@/lib/types';

export interface KeywordDensityInput {
    content: string;
    targetKeyword?: string;
    isHtml?: boolean;
    includeStopWords?: boolean;
    topCount?: number;
}

/**
 * Convert frequency map to sorted density items
 */
function frequencyToDensityItems(
    frequency: Map<string, number>,
    totalWords: number,
    includeStopWords: boolean,
    topCount: number
): KeywordDensityItem[] {
    const items: KeywordDensityItem[] = [];

    for (const [keyword, count] of frequency) {
        // Skip stop words if not included
        if (!includeStopWords && STOP_WORDS.has(keyword.toLowerCase())) {
            continue;
        }

        // Skip single character keywords
        if (keyword.length <= 1) {
            continue;
        }

        const density = totalWords > 0 ? (count / totalWords) * 100 : 0;

        items.push({
            keyword,
            count,
            density: Math.round(density * 100) / 100,
        });
    }

    // Sort by count descending
    items.sort((a, b) => b.count - a.count);

    // Return top N
    return items.slice(0, topCount);
}

/**
 * Analyze keyword density in content
 */
export function analyzeKeywordDensity(input: KeywordDensityInput): ToolResult<KeywordDensityResult> {
    const startTime = performance.now();

    let { content, targetKeyword, isHtml = false, includeStopWords = false, topCount = 20 } = input;

    if (!content || content.trim().length === 0) {
        return {
            success: false,
            error: 'Content is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Strip HTML if needed
    if (isHtml) {
        content = stripHtml(content);
    }

    // Get word counts
    const totalWords = countWords(content);

    // Get single word frequency
    const singleWordFreq = getWordFrequency(content, false);
    const uniqueWords = singleWordFreq.size;

    // Get n-gram frequencies
    const twoWordFreq = getNGramFrequency(content, 2, false);
    const threeWordFreq = getNGramFrequency(content, 3, false);

    // Convert to density items
    const singleWords = frequencyToDensityItems(singleWordFreq, totalWords, includeStopWords, topCount);
    const twoWordPhrases = frequencyToDensityItems(twoWordFreq, totalWords, true, topCount);
    const threeWordPhrases = frequencyToDensityItems(threeWordFreq, totalWords, true, topCount);

    // Analyze target keyword if provided
    let targetKeywordResult = undefined;
    if (targetKeyword && targetKeyword.trim()) {
        const density = calculateKeywordDensity(content, targetKeyword);
        const keywordLower = targetKeyword.toLowerCase();
        const pattern = new RegExp(`\\b${escapeRegex(keywordLower)}\\b`, 'gi');
        const matches = content.toLowerCase().match(pattern) || [];

        let recommendation: string;
        if (density < 0.5) {
            recommendation = 'Keyword density is low. Consider using the keyword more naturally in your content.';
        } else if (density <= 2.5) {
            recommendation = 'Keyword density is optimal for SEO.';
        } else if (density <= 4) {
            recommendation = 'Keyword density is slightly high. Reduce usage to avoid keyword stuffing.';
        } else {
            recommendation = 'Keyword density is too high. This may be seen as keyword stuffing by search engines.';
        }

        targetKeywordResult = {
            keyword: targetKeyword,
            count: matches.length,
            density: Math.round(density * 100) / 100,
            recommendation,
        };
    }

    return {
        success: true,
        data: {
            totalWords,
            uniqueWords,
            singleWords,
            twoWordPhrases,
            threeWordPhrases,
            targetKeyword: targetKeywordResult,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Escape regex special characters
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get optimal keyword density recommendation
 */
export function getOptimalDensity(): { min: number; max: number; ideal: number } {
    return {
        min: 0.5,
        max: 2.5,
        ideal: 1.5,
    };
}

/**
 * Suggest related keywords based on content
 */
export function suggestRelatedKeywords(content: string, mainKeyword: string): string[] {
    const result = analyzeKeywordDensity({
        content,
        isHtml: false,
        includeStopWords: false,
        topCount: 50
    });

    if (!result.success || !result.data) {
        return [];
    }

    const mainWords = new Set(mainKeyword.toLowerCase().split(/\s+/));

    // Find related phrases that contain parts of the main keyword
    const related: string[] = [];

    for (const phrase of result.data.twoWordPhrases) {
        const phraseWords = phrase.keyword.toLowerCase().split(/\s+/);
        const hasRelated = phraseWords.some(word => mainWords.has(word));
        if (hasRelated && phrase.keyword.toLowerCase() !== mainKeyword.toLowerCase()) {
            related.push(phrase.keyword);
        }
    }

    return related.slice(0, 10);
}

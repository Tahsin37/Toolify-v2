/**
 * Word Counter (Advanced)
 * 
 * Comprehensive word counting with sentences, paragraphs,
 * reading time, and speaking time calculations.
 */

import {
    countWords,
    countSentences,
    countParagraphs,
    countLines,
    calculateReadingTime,
    calculateSpeakingTime,
    getWordFrequency
} from '@/lib/utils/text-analysis';
import type { ToolResult, WordCountResult } from '@/lib/types';

export interface WordCountInput {
    text: string;
    wordsPerMinuteReading?: number;
    wordsPerMinuteSpeaking?: number;
}

/**
 * Perform comprehensive word count analysis
 */
export function countWordsAdvanced(input: WordCountInput): ToolResult<WordCountResult> {
    const startTime = performance.now();

    const {
        text,
        wordsPerMinuteReading = 225,
        wordsPerMinuteSpeaking = 140
    } = input;

    if (text === undefined || text === null) {
        return {
            success: false,
            error: 'Text is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Basic counts
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = countWords(text);
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const lines = countLines(text);

    // Time calculations
    const readingTimeMinutes = calculateReadingTime(text, wordsPerMinuteReading);
    const speakingTimeMinutes = calculateSpeakingTime(text, wordsPerMinuteSpeaking);

    // Calculate averages
    const averageWordLength = words > 0
        ? Math.round((charactersNoSpaces / words) * 10) / 10
        : 0;

    const averageSentenceLength = sentences > 0
        ? Math.round((words / sentences) * 10) / 10
        : 0;

    return {
        success: true,
        data: {
            characters,
            charactersNoSpaces,
            words,
            sentences,
            paragraphs,
            lines,
            readingTimeMinutes,
            speakingTimeMinutes,
            averageWordLength,
            averageSentenceLength,
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Get detailed word statistics
 */
export function getWordStats(text: string): {
    totalWords: number;
    uniqueWords: number;
    averageWordLength: number;
    longestWord: string;
    shortestWord: string;
    mostCommonWords: Array<{ word: string; count: number }>;
} {
    const frequency = getWordFrequency(text, false);
    const words = text.toLowerCase().match(/\b[\w'-]+\b/g) || [];

    let longestWord = '';
    let shortestWord = words[0] || '';

    for (const word of words) {
        if (word.length > longestWord.length) {
            longestWord = word;
        }
        if (word.length < shortestWord.length && word.length > 0) {
            shortestWord = word;
        }
    }

    // Sort by frequency
    const sortedFrequency = Array.from(frequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, count]) => ({ word, count }));

    const totalChars = words.reduce((sum, word) => sum + word.length, 0);

    return {
        totalWords: words.length,
        uniqueWords: frequency.size,
        averageWordLength: words.length > 0 ? Math.round((totalChars / words.length) * 10) / 10 : 0,
        longestWord,
        shortestWord,
        mostCommonWords: sortedFrequency,
    };
}

/**
 * Format reading/speaking time as human readable string
 */
export function formatTime(minutes: number): string {
    if (minutes < 1) {
        return 'Less than a minute';
    } else if (minutes === 1) {
        return '1 minute';
    } else if (minutes < 60) {
        return `${minutes} minutes`;
    } else {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (remainingMinutes === 0) {
            return hours === 1 ? '1 hour' : `${hours} hours`;
        }

        return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    }
}

/**
 * Get grade level estimation (Flesch-Kincaid)
 */
export function estimateGradeLevel(text: string): {
    gradeLevel: number;
    readingEase: number;
    difficulty: string;
} {
    const words = countWords(text);
    const sentences = countSentences(text);
    const syllables = countSyllables(text);

    if (words === 0 || sentences === 0) {
        return {
            gradeLevel: 0,
            readingEase: 100,
            difficulty: 'Very Easy',
        };
    }

    // Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;

    // Flesch Reading Ease
    const readingEase = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);

    // Difficulty classification
    let difficulty: string;
    if (readingEase >= 90) {
        difficulty = 'Very Easy';
    } else if (readingEase >= 80) {
        difficulty = 'Easy';
    } else if (readingEase >= 70) {
        difficulty = 'Fairly Easy';
    } else if (readingEase >= 60) {
        difficulty = 'Standard';
    } else if (readingEase >= 50) {
        difficulty = 'Fairly Difficult';
    } else if (readingEase >= 30) {
        difficulty = 'Difficult';
    } else {
        difficulty = 'Very Difficult';
    }

    return {
        gradeLevel: Math.max(0, Math.round(gradeLevel * 10) / 10),
        readingEase: Math.max(0, Math.min(100, Math.round(readingEase * 10) / 10)),
        difficulty,
    };
}

/**
 * Count syllables in text (approximate)
 */
function countSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    let totalSyllables = 0;

    for (const word of words) {
        totalSyllables += countWordSyllables(word);
    }

    return totalSyllables;
}

/**
 * Count syllables in a single word (approximate)
 */
function countWordSyllables(word: string): number {
    if (word.length <= 3) return 1;

    // Remove silent e at end
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    // Count vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

/**
 * Text Analysis Utilities
 * 
 * Common text processing utilities used across multiple tools.
 */

/**
 * Count words in text
 */
export function countWords(text: string): number {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Count sentences in text
 */
export function countSentences(text: string): number {
    if (!text || !text.trim()) return 0;
    // Match sentence-ending punctuation followed by space or end of string
    const sentences = text.split(/[.!?]+\s*/).filter(s => s.trim().length > 0);
    return sentences.length;
}

/**
 * Count paragraphs in text
 */
export function countParagraphs(text: string): number {
    if (!text || !text.trim()) return 0;
    return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
}

/**
 * Count lines in text
 */
export function countLines(text: string): number {
    if (!text) return 0;
    return text.split('\n').length;
}

/**
 * Calculate reading time in minutes
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 225): number {
    const words = countWords(text);
    return Math.ceil(words / wordsPerMinute);
}

/**
 * Calculate speaking time in minutes
 * Average speaking speed: 125-150 words per minute
 */
export function calculateSpeakingTime(text: string, wordsPerMinute: number = 140): number {
    const words = countWords(text);
    return Math.ceil(words / wordsPerMinute);
}

/**
 * Get word frequency map
 */
export function getWordFrequency(text: string, caseSensitive: boolean = false): Map<string, number> {
    const frequency = new Map<string, number>();

    if (!text) return frequency;

    const normalizedText = caseSensitive ? text : text.toLowerCase();
    const words = normalizedText.match(/\b[\w'-]+\b/g) || [];

    for (const word of words) {
        const count = frequency.get(word) || 0;
        frequency.set(word, count + 1);
    }

    return frequency;
}

/**
 * Get n-gram frequency (phrases of n words)
 */
export function getNGramFrequency(
    text: string,
    n: number,
    caseSensitive: boolean = false
): Map<string, number> {
    const frequency = new Map<string, number>();

    if (!text || n < 1) return frequency;

    const normalizedText = caseSensitive ? text : text.toLowerCase();
    const words = normalizedText.match(/\b[\w'-]+\b/g) || [];

    if (words.length < n) return frequency;

    for (let i = 0; i <= words.length - n; i++) {
        const ngram = words.slice(i, i + n).join(' ');
        const count = frequency.get(ngram) || 0;
        frequency.set(ngram, count + 1);
    }

    return frequency;
}

/**
 * Calculate keyword density
 */
export function calculateKeywordDensity(text: string, keyword: string): number {
    if (!text || !keyword) return 0;

    const totalWords = countWords(text);
    if (totalWords === 0) return 0;

    const keywordLower = keyword.toLowerCase();
    const textLower = text.toLowerCase();

    // Count keyword occurrences
    const keywordWords = keywordLower.split(/\s+/).length;
    const pattern = new RegExp(`\\b${escapeRegex(keywordLower)}\\b`, 'gi');
    const matches = textLower.match(pattern) || [];

    // Calculate density as percentage
    return (matches.length * keywordWords / totalWords) * 100;
}

/**
 * Escape special regex characters
 */
export function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Common English stop words
 */
export const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
    'have', 'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
    'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'can', 'should', 'now', 'i', 'you', 'we', 'our', 'your',
]);

/**
 * Remove stop words from text
 */
export function removeStopWords(text: string): string {
    const words = text.toLowerCase().split(/\s+/);
    return words.filter(word => !STOP_WORDS.has(word)).join(' ');
}

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
    const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
    return text.match(urlPattern) || [];
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
    const hashtagPattern = /#[\w]+/g;
    return text.match(hashtagPattern) || [];
}

/**
 * Extract mentions from text
 */
export function extractMentions(text: string): string[] {
    const mentionPattern = /@[\w]+/g;
    return text.match(mentionPattern) || [];
}

/**
 * Count emojis in text
 */
export function countEmojis(text: string): number {
    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const matches = text.match(emojiPattern);
    return matches ? matches.length : 0;
}

/**
 * Normalize whitespace in text
 */
export function normalizeWhitespace(text: string): string {
    return text
        .replace(/\r\n/g, '\n')      // Normalize line endings
        .replace(/\r/g, '\n')
        .replace(/[ \t]+/g, ' ')     // Multiple spaces/tabs to single space
        .replace(/ +\n/g, '\n')      // Remove trailing spaces
        .replace(/\n +/g, '\n')      // Remove leading spaces on lines
        .replace(/\n{3,}/g, '\n\n')  // Max 2 consecutive newlines
        .trim();
}

/**
 * Calculate text similarity using Levenshtein distance
 */
export function calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 100;
    if (!str1 || !str2) return 0;

    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;

    const distance = levenshteinDistance(str1, str2);
    return Math.round((1 - distance / maxLength) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
            }
        }
    }

    return dp[m][n];
}

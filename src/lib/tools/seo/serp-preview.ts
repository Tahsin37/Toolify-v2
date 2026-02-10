/**
 * SERP Preview Tool
 * 
 * Generates Google Search Engine Results Page previews for titles, 
 * descriptions, and URLs.
 */

import {
    calculateTitlePixelWidth,
    calculateDescriptionPixelWidth,
    truncateToPixelWidth,
    willBeTruncated,
    SERP_LIMITS
} from '@/lib/utils/pixel-width';
import type { ToolResult, SERPPreviewResult } from '@/lib/types';

export interface SERPPreviewInput {
    title: string;
    description: string;
    url: string;
}

/**
 * Format URL for SERP display
 */
function formatSerpUrl(url: string): string {
    try {
        const parsed = new URL(url);

        // Build breadcrumb-style path
        const pathParts = parsed.pathname.split('/').filter(Boolean);

        if (pathParts.length === 0) {
            return parsed.hostname;
        }

        // Format path parts with arrows
        const formattedPath = pathParts
            .map(part => part.replace(/-/g, ' '))
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' › ');

        return `${parsed.hostname} › ${formattedPath}`;
    } catch {
        return url;
    }
}

/**
 * Generate SERP preview
 */
export function generateSerpPreview(input: SERPPreviewInput): ToolResult<SERPPreviewResult> {
    const startTime = performance.now();

    const { title, description, url } = input;

    if (!title || title.trim().length === 0) {
        return {
            success: false,
            error: 'Title is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Calculate title metrics
    const titlePixelWidth = calculateTitlePixelWidth(title);
    const titleTruncatedDesktop = willBeTruncated(title, SERP_LIMITS.title.desktop, SERP_LIMITS.title.fontSize);
    const titleTruncatedMobile = willBeTruncated(title, SERP_LIMITS.title.mobile, SERP_LIMITS.title.fontSize);

    const titleDisplayText = titleTruncatedDesktop
        ? truncateToPixelWidth(title, SERP_LIMITS.title.desktop, SERP_LIMITS.title.fontSize)
        : title;

    // Calculate description metrics
    const descPixelWidth = calculateDescriptionPixelWidth(description || '');
    const descTruncatedDesktop = description
        ? willBeTruncated(description, SERP_LIMITS.description.desktop, SERP_LIMITS.description.fontSize)
        : false;

    const descDisplayText = description
        ? (descTruncatedDesktop
            ? truncateToPixelWidth(description, SERP_LIMITS.description.desktop, SERP_LIMITS.description.fontSize)
            : description)
        : '';

    // Format URL
    const urlDisplayText = url ? formatSerpUrl(url) : '';

    return {
        success: true,
        data: {
            title: {
                text: title,
                displayText: titleDisplayText,
                isTruncated: titleTruncatedDesktop,
                pixelWidth: titlePixelWidth,
            },
            description: {
                text: description || '',
                displayText: descDisplayText,
                isTruncated: descTruncatedDesktop,
                pixelWidth: descPixelWidth,
            },
            url: {
                text: url || '',
                displayText: urlDisplayText,
            },
            desktop: {
                titleMaxWidth: SERP_LIMITS.title.desktop,
                descriptionMaxWidth: SERP_LIMITS.description.desktop,
            },
            mobile: {
                titleMaxWidth: SERP_LIMITS.title.mobile,
                descriptionMaxWidth: SERP_LIMITS.description.mobile,
            },
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Generate mobile SERP preview (different width limits)
 */
export function generateMobileSerpPreview(input: SERPPreviewInput): ToolResult<SERPPreviewResult> {
    const startTime = performance.now();

    const { title, description, url } = input;

    if (!title || title.trim().length === 0) {
        return {
            success: false,
            error: 'Title is required',
            processingTime: performance.now() - startTime,
        };
    }

    // Mobile has wider title limit but narrower description
    const titlePixelWidth = calculateTitlePixelWidth(title);
    const titleTruncated = willBeTruncated(title, SERP_LIMITS.title.mobile, SERP_LIMITS.title.fontSize);

    const titleDisplayText = titleTruncated
        ? truncateToPixelWidth(title, SERP_LIMITS.title.mobile, SERP_LIMITS.title.fontSize)
        : title;

    const descPixelWidth = calculateDescriptionPixelWidth(description || '');
    const descTruncated = description
        ? willBeTruncated(description, SERP_LIMITS.description.mobile, SERP_LIMITS.description.fontSize)
        : false;

    const descDisplayText = description
        ? (descTruncated
            ? truncateToPixelWidth(description, SERP_LIMITS.description.mobile, SERP_LIMITS.description.fontSize)
            : description)
        : '';

    const urlDisplayText = url ? formatSerpUrl(url) : '';

    return {
        success: true,
        data: {
            title: {
                text: title,
                displayText: titleDisplayText,
                isTruncated: titleTruncated,
                pixelWidth: titlePixelWidth,
            },
            description: {
                text: description || '',
                displayText: descDisplayText,
                isTruncated: descTruncated,
                pixelWidth: descPixelWidth,
            },
            url: {
                text: url || '',
                displayText: urlDisplayText,
            },
            desktop: {
                titleMaxWidth: SERP_LIMITS.title.desktop,
                descriptionMaxWidth: SERP_LIMITS.description.desktop,
            },
            mobile: {
                titleMaxWidth: SERP_LIMITS.title.mobile,
                descriptionMaxWidth: SERP_LIMITS.description.mobile,
            },
        },
        processingTime: performance.now() - startTime,
    };
}

/**
 * Get SERP optimization suggestions
 */
export function getSerpSuggestions(input: SERPPreviewInput): string[] {
    const suggestions: string[] = [];
    const preview = generateSerpPreview(input);

    if (!preview.success || !preview.data) {
        return suggestions;
    }

    const { title, description } = preview.data;

    // Title suggestions
    if (title.isTruncated) {
        suggestions.push('Title will be truncated on desktop. Shorten to under 60 characters.');
    } else if (title.pixelWidth < 300) {
        suggestions.push('Title is short. Consider making it more descriptive for better CTR.');
    }

    if (!title.text.match(/\d/)) {
        suggestions.push('Consider adding numbers to your title (e.g., "Top 10...", "2024...")');
    }

    // Description suggestions
    if (!description.text) {
        suggestions.push('Add a meta description to control your SERP snippet.');
    } else if (description.isTruncated) {
        suggestions.push('Description will be truncated. Front-load important keywords.');
    } else if (description.pixelWidth < 400) {
        suggestions.push('Description is short. Add more compelling content.');
    }

    if (description.text && !description.text.includes('|') && !description.text.includes('-')) {
        suggestions.push('Consider adding a call-to-action in your description.');
    }

    return suggestions;
}

/**
 * Generate HTML for SERP preview rendering
 */
export function generateSerpPreviewHtml(input: SERPPreviewInput): string {
    const preview = generateSerpPreview(input);

    if (!preview.success || !preview.data) {
        return '';
    }

    const { title, description, url } = preview.data;

    return `
<div class="serp-result" style="font-family: Arial, sans-serif; max-width: 600px;">
  <div class="serp-url" style="font-size: 14px; color: #202124; line-height: 1.3;">
    <cite style="color: #4d5156; font-style: normal;">${escapeHtml(url.displayText)}</cite>
  </div>
  <div class="serp-title" style="margin-top: 4px;">
    <a href="${escapeHtml(url.text)}" style="font-size: 20px; color: #1a0dab; text-decoration: none; line-height: 1.3;">
      ${escapeHtml(title.displayText)}
    </a>
  </div>
  <div class="serp-description" style="margin-top: 4px; font-size: 14px; color: #4d5156; line-height: 1.58;">
    ${escapeHtml(description.displayText)}
  </div>
</div>
`.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

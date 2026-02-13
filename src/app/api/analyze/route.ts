import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        const startTime = performance.now();

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ToolifyBot/1.0; +https://toolify.com)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            next: { revalidate: 60 } // Cache for 1 minute
        });

        const html = await response.text();
        const loadTime = Math.round(performance.now() - startTime);
        const $ = cheerio.load(html);

        // Extract Meta Tags
        const meta = {
            title: $('title').text() || $('meta[property="og:title"]').attr('content'),
            description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'),
            keywords: $('meta[name="keywords"]').attr('content'),
            robots: $('meta[name="robots"]').attr('content'),
            canonical: $('link[rel="canonical"]').attr('href'),
            ogImage: $('meta[property="og:image"]').attr('content'),
            ogTitle: $('meta[property="og:title"]').attr('content'),
            ogDescription: $('meta[property="og:description"]').attr('content'),
            favicon: $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '/favicon.ico',
            charSet: $('meta[charset]').attr('charset') || 'utf-8',
        };

        // Fix relative URLs
        if (meta.ogImage && !meta.ogImage.startsWith('http')) {
            try { meta.ogImage = new URL(meta.ogImage, targetUrl).href; } catch { }
        }
        if (meta.favicon && !meta.favicon.startsWith('http')) {
            try { meta.favicon = new URL(meta.favicon, targetUrl).href; } catch { }
        }

        // Analyze Headings
        const headings = {
            h1: $('h1').map((_, el) => $(el).text().trim()).get(),
            h2Count: $('h2').length,
            h3Count: $('h3').length,
        };

        // Analyze Links
        const links = $('a').map((_, el) => $(el).attr('href')).get().filter(Boolean);
        const internalLinks = links.filter(l => l.startsWith('/') || l.includes(new URL(targetUrl).hostname)).length;
        const externalLinks = links.length - internalLinks;

        // Headers
        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => headers[key] = value);

        return NextResponse.json({
            url: targetUrl,
            status: response.ok ? 'success' : 'error',
            statusCode: response.status,
            loadTime,
            ssl: targetUrl.startsWith('https'),
            contentLength: html.length,
            server: headers['server'] || 'Unknown',
            contentType: headers['content-type'],
            meta,
            headings,
            links: { total: links.length, internal: internalLinks, external: externalLinks },
            headers,
        });

    } catch (error: any) {
        return NextResponse.json({
            error: 'Failed to analyze website. The URL might be invalid or blocking bot requests.',
            details: error.message
        }, { status: 500 });
    }
}

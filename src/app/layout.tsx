import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        template: '%s | Toolify — Free Online Tools',
        default: 'Toolify — Free Online Developer Tools, Converters, SEO & Utilities',
    },
    description: 'Toolify offers 50+ free online tools for developers and creators — JSON formatter, image converter, SEO analyzer, PDF tools, code minifier, and more. No signup, 100% privacy-first.',
    keywords: [
        'free online tools', 'developer tools', 'SEO tools', 'image converter',
        'JSON formatter', 'PDF converter', 'code minifier', 'base64 encoder',
        'QR code generator', 'color picker', 'markdown editor', 'text tools',
        'web analyzer', 'file converter', 'online utilities', 'Toolify',
    ],
    openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: 'Toolify',
        title: 'Toolify — 50+ Free Online Tools for Developers & Creators',
        description: 'Free, fast, privacy-first online tools: converters, SEO analyzers, code utilities, image tools, and more. No signup required.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Toolify — Free Online Developer Tools',
        description: '50+ free tools for SEO, development, conversion, and content creation. All client-side, no data collected.',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
    alternates: {
        canonical: 'https://toolify.app',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={clsx(inter.variable, jetbrainsMono.variable)}>
            <body className="min-h-screen antialiased selection:bg-blue-500/30">
                {children}
                <Analytics />
            </body>
        </html>
    );
}

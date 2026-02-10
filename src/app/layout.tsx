import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { clsx } from 'clsx';

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
        template: '%s | SEO Tools Platform',
        default: 'SEO Tools Platform - Free Online Tools',
    },
    description: 'Free, fast, and reliable online tools for SEO, development, and content creation.',
    openGraph: {
        type: 'website',
        locale: 'en_US',
        siteName: 'SEO Tools Platform',
    },
    twitter: {
        card: 'summary_large_image',
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
            </body>
        </html>
    );
}

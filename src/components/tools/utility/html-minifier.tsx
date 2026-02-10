'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, CheckCircle2, Minimize2 } from 'lucide-react';

export function HtmlMinifier() {
    const [code, setCode] = React.useState('');
    const [minified, setMinified] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [stats, setStats] = React.useState({ original: 0, minified: 0, saved: 0 });

    const minifyHtml = (html: string): string => {
        return html
            // Remove HTML comments
            .replace(/<!--[\s\S]*?-->/g, '')
            // Remove whitespace between tags
            .replace(/>\s+</g, '><')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove leading/trailing whitespace in tags
            .replace(/(<[^>]+>)\s+/g, '$1')
            .replace(/\s+(<\/[^>]+>)/g, '$1')
            // Remove empty attributes
            .replace(/\s+(?=[^=<]*[<>])/g, ' ')
            .trim();
    };

    const handleMinify = () => {
        const result = minifyHtml(code);
        setMinified(result);
        setStats({
            original: code.length,
            minified: result.length,
            saved: code.length > 0 ? Math.round((1 - result.length / code.length) * 100) : 0
        });
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(minified);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadMinified = () => {
        const blob = new Blob([minified], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.min.html';
        a.click();
        URL.revokeObjectURL(url);
    };

    const sampleCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
</head>
<body>
    <!-- Main content area -->
    <div class="container">
        <header>
            <h1>Welcome to My Website</h1>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </nav>
        </header>
        
        <main>
            <p>This is a sample paragraph with some text content.</p>
        </main>
        
        <!-- Footer section -->
        <footer>
            <p>&copy; 2024 My Website</p>
        </footer>
    </div>
</body>
</html>`;

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">HTML Code</label>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCode(sampleCode)}
                        className="text-xs text-indigo-600"
                    >
                        Load Example
                    </Button>
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your HTML code here..."
                    className="w-full h-56 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-orange-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="mt-2 text-xs text-slate-500 text-right">
                    {code.length} characters
                </div>
            </Card>

            {/* Minify Button */}
            <Button
                onClick={handleMinify}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
                disabled={!code.trim()}
            >
                <Minimize2 className="h-5 w-5 mr-2" />
                Minify HTML
            </Button>

            {/* Stats */}
            {minified && (
                <Card className="p-4 bg-emerald-50 border border-emerald-200">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-emerald-600 mb-1">Original</p>
                            <p className="font-bold text-lg text-emerald-800">{stats.original} bytes</p>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-600 mb-1">Minified</p>
                            <p className="font-bold text-lg text-emerald-800">{stats.minified} bytes</p>
                        </div>
                        <div>
                            <p className="text-xs text-emerald-600 mb-1">Saved</p>
                            <p className="font-bold text-lg text-emerald-800">{stats.saved}%</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Output */}
            {minified && (
                <Card className="p-4 bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-300">Minified Output</span>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                className="text-slate-400 hover:text-white"
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={downloadMinified}
                                className="text-slate-400 hover:text-white"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-40 overflow-auto">
                        <pre className="text-xs text-orange-400 font-mono whitespace-pre-wrap break-all">{minified}</pre>
                    </div>
                </Card>
            )}
        </div>
    );
}

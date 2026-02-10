'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileText, CheckCircle2 } from 'lucide-react';
import TurndownService from 'turndown';

export function HtmlToMarkdown() {
    const [html, setHtml] = React.useState('');
    const [markdown, setMarkdown] = React.useState('');
    const [copied, setCopied] = React.useState(false);

    const turndownService = React.useMemo(() => {
        const service = new TurndownService({
            headingStyle: 'atx',
            codeBlockStyle: 'fenced',
            bulletListMarker: '-',
        });
        return service;
    }, []);

    React.useEffect(() => {
        if (html) {
            try {
                const converted = turndownService.turndown(html);
                setMarkdown(converted);
            } catch (err) {
                setMarkdown('Error converting HTML');
            }
        } else {
            setMarkdown('');
        }
    }, [html, turndownService]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadMarkdown = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.md';
        link.click();
        URL.revokeObjectURL(url);
    };

    const sampleHtml = `<h1>Hello World</h1>
<p>This is a <strong>bold</strong> and <em>italic</em> text example.</p>
<h2>Features</h2>
<ul>
    <li>List item 1</li>
    <li>List item 2</li>
    <li>List item 3</li>
</ul>
<h3>Code Example</h3>
<pre><code>const greeting = "Hello, World!";
console.log(greeting);</code></pre>
<blockquote>This is a blockquote</blockquote>
<p><a href="https://google.com">Visit Google</a></p>`;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HTML Input */}
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-700">HTML Input</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHtml(sampleHtml)}
                            className="text-xs text-indigo-600"
                        >
                            Load Example
                        </Button>
                    </div>
                    <textarea
                        value={html}
                        onChange={(e) => setHtml(e.target.value)}
                        placeholder="<h1>Enter your HTML here...</h1>"
                        className="w-full h-80 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </Card>

                {/* Markdown Output */}
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-700">Markdown Output</h3>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!markdown}
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={downloadMarkdown}
                                disabled={!markdown}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="h-80 overflow-auto px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{markdown || 'Markdown will appear here...'}</pre>
                    </div>
                </Card>
            </div>

            {/* Actions */}
            {markdown && (
                <div className="flex gap-4">
                    <Button
                        onClick={copyToClipboard}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12"
                    >
                        {copied ? (
                            <>
                                <CheckCircle2 className="h-5 w-5 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-5 w-5 mr-2" />
                                Copy Markdown
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={downloadMarkdown}
                        variant="outline"
                        className="flex-1 h-12"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download .md File
                    </Button>
                </div>
            )}
        </div>
    );
}

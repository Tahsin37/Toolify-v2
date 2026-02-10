'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, FileCode, CheckCircle2 } from 'lucide-react';
import { marked } from 'marked';

export function MarkdownToHtml() {
    const [markdown, setMarkdown] = React.useState('');
    const [html, setHtml] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [showPreview, setShowPreview] = React.useState(true);

    React.useEffect(() => {
        if (markdown) {
            const converted = marked.parse(markdown) as string;
            setHtml(converted);
        } else {
            setHtml('');
        }
    }, [markdown]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadHtml = () => {
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 4px; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.html';
        link.click();
        URL.revokeObjectURL(url);
    };

    const sampleMarkdown = `# Hello World

This is a **bold** and *italic* text example.

## Features

- List item 1
- List item 2
- List item 3

### Code Example

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> This is a blockquote

[Visit Google](https://google.com)`;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Markdown Input */}
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-700">Markdown Input</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMarkdown(sampleMarkdown)}
                            className="text-xs text-indigo-600"
                        >
                            Load Example
                        </Button>
                    </div>
                    <textarea
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        placeholder="# Enter your markdown here..."
                        className="w-full h-80 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </Card>

                {/* Output */}
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                            <Button
                                variant={showPreview ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setShowPreview(true)}
                                className="text-xs"
                            >
                                Preview
                            </Button>
                            <Button
                                variant={!showPreview ? "primary" : "outline"}
                                size="sm"
                                onClick={() => setShowPreview(false)}
                                className="text-xs"
                            >
                                HTML Code
                            </Button>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!html}
                            >
                                {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={downloadHtml}
                                disabled={!html}
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {showPreview ? (
                        <div
                            className="h-80 overflow-auto px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg prose prose-sm prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: html }}
                        />
                    ) : (
                        <div className="h-80 overflow-auto px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg">
                            <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{html}</pre>
                        </div>
                    )}
                </Card>
            </div>

            {/* Actions */}
            {html && (
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
                                Copy HTML
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={downloadHtml}
                        variant="outline"
                        className="flex-1 h-12"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download HTML File
                    </Button>
                </div>
            )}
        </div>
    );
}

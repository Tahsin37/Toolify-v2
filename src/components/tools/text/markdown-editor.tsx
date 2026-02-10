'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText, Copy, CheckCircle2, Info, Download, Eye, Edit3
} from 'lucide-react';

export function MarkdownEditor() {
    const [markdown, setMarkdown] = React.useState(`# Welcome to Markdown Editor

This is a **live preview** markdown editor. Type on the left, see results on the right!

## Features

- **Bold** and *italic* text
- Lists and checkboxes
- Code blocks
- Links and images
- Tables and more!

### Code Example

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

> This is a blockquote. It can span multiple lines.

| Feature | Status |
|---------|--------|
| Bold    | ✅     |
| Italic  | ✅     |
| Links   | ✅     |

Made with ❤️ by Toolify
`);
    const [copied, setCopied] = React.useState(false);
    const [view, setView] = React.useState<'split' | 'edit' | 'preview'>('split');

    const copyMarkdown = async () => {
        await navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadMarkdown = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        a.click();
        URL.revokeObjectURL(url);
    };

    const parseMarkdown = (md: string): string => {
        let html = md
            // Headers
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
            // Bold and italic
            .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Code blocks
            .replace(/```(\w*)\n([\s\S]*?)```/gim, '<pre class="bg-slate-800 text-slate-100 p-4 rounded-lg my-4 overflow-x-auto text-sm"><code>$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code class="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded text-sm">$1</code>')
            // Blockquotes
            .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-500 pl-4 italic text-slate-600 my-4">$1</blockquote>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" class="text-indigo-600 hover:underline">$1</a>')
            // Horizontal rules
            .replace(/^---$/gim, '<hr class="my-6 border-slate-200" />')
            // Unordered lists
            .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
            .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
            // Checkboxes
            .replace(/- \[x\] (.*$)/gim, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" checked disabled class="h-4 w-4" />$1</li>')
            .replace(/- \[ \] (.*$)/gim, '<li class="ml-4 flex items-center gap-2"><input type="checkbox" disabled class="h-4 w-4" />$1</li>')
            // Images
            .replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />')
            // Paragraphs
            .replace(/\n\n/gim, '</p><p class="my-2">')
            // Line breaks
            .replace(/\n/gim, '<br />');

        // Wrap in paragraph
        html = '<p class="my-2">' + html + '</p>';

        // Simple table parsing
        html = html.replace(/<p class="my-2">\|(.+)\|<br \/>\|[-| ]+\|<br \/>([\s\S]*?)<\/p>/gim, (_, header, body) => {
            const headers = header.split('|').filter(Boolean).map((h: string) => `<th class="border border-slate-200 px-3 py-2 text-left bg-slate-50">${h.trim()}</th>`).join('');
            const rows = body.split('<br />').filter(Boolean).map((row: string) => {
                const cells = row.replace(/^\||\|$/g, '').split('|').map((c: string) => `<td class="border border-slate-200 px-3 py-2">${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            }).join('');
            return `<table class="w-full border-collapse my-4"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
        });

        return html;
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <Card className="p-3 bg-white border border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                        <Button
                            variant={view === 'edit' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setView('edit')}
                        >
                            <Edit3 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                            variant={view === 'split' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setView('split')}
                        >
                            Split
                        </Button>
                        <Button
                            variant={view === 'preview' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setView('preview')}
                        >
                            <Eye className="h-4 w-4 mr-1" /> Preview
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyMarkdown}>
                            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Editor */}
            <div className={`grid gap-4 ${view === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {(view === 'edit' || view === 'split') && (
                    <Card className="p-0 bg-white border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                            <p className="text-xs font-medium text-slate-500">MARKDOWN</p>
                        </div>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            className="w-full h-[500px] p-4 font-mono text-sm resize-none focus:outline-none"
                            placeholder="Type your markdown here..."
                        />
                    </Card>
                )}

                {(view === 'preview' || view === 'split') && (
                    <Card className="p-0 bg-white border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 px-3 py-2 border-b border-slate-200">
                            <p className="text-xs font-medium text-slate-500">PREVIEW</p>
                        </div>
                        <div
                            className="p-4 h-[500px] overflow-auto prose prose-slate max-w-none"
                            dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
                        />
                    </Card>
                )}
            </div>

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Markdown Editor</h4>
                        <p className="text-sm text-indigo-700">
                            Write and preview Markdown in real-time. Supports headers, bold, italic,
                            code blocks, links, images, tables, and more. Export as .md file.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

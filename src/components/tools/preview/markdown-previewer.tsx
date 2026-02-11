'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, Upload, Copy, Check, Eye, Code, Info, Columns } from 'lucide-react';

const SAMPLE_MARKDOWN = `# Welcome to Markdown Previewer

## Features
- **Bold text** and *italic text*
- ~~Strikethrough~~ text
- [Links](https://example.com)
- Inline \`code\` snippets

## Code Block
\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

## Lists

### Ordered
1. First item
2. Second item
3. Third item

### Unordered
- Item A
- Item B
  - Nested item

## Blockquote
> "The best way to predict the future is to create it." — Abraham Lincoln

## Table
| Feature | Status |
|---------|--------|
| Bold | ✅ |
| Italic | ✅ |
| Links | ✅ |
| Tables | ✅ |

---

*Powered by Toolify*
`;

// Simple markdown to HTML converter (no external deps)
function markdownToHtml(md: string): string {
    let html = md;

    // Code blocks (must come first to protect their content)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
        return `<pre class="md-code-block"><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

    // Headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6 class="md-h6">$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5 class="md-h5">$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4 class="md-h4">$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3 class="md-h3">$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2 class="md-h2">$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1 class="md-h1">$1</h1>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr class="md-hr" />');

    // Bold and italic
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Links and images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-link" target="_blank" rel="noopener">$1</a>');

    // Blockquotes
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');

    // Tables
    html = html.replace(/^(\|.+\|)\n(\|[-| :]+\|)\n((?:\|.+\|\n?)+)/gm, (_match, header, _sep, body) => {
        const headerCells = header.split('|').filter((c: string) => c.trim()).map((c: string) =>
            `<th class="md-th">${c.trim()}</th>`
        ).join('');
        const rows = body.trim().split('\n').map((row: string) => {
            const cells = row.split('|').filter((c: string) => c.trim()).map((c: string) =>
                `<td class="md-td">${c.trim()}</td>`
            ).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        return `<table class="md-table"><thead><tr>${headerCells}</tr></thead><tbody>${rows}</tbody></table>`;
    });

    // Unordered lists
    html = html.replace(/^(\s*)[-*]\s+(.+)$/gm, (_match, indent, content) => {
        const level = indent.length >= 2 ? 'md-li-nested' : 'md-li';
        return `<li class="${level}">${content}</li>`;
    });

    // Ordered lists
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="md-oli">$1</li>');

    // Wrap consecutive li elements in ul/ol
    html = html.replace(/((?:<li class="md-(?:li|li-nested)">.*<\/li>\n?)+)/g, '<ul class="md-ul">$1</ul>');
    html = html.replace(/((?:<li class="md-oli">.*<\/li>\n?)+)/g, '<ol class="md-ol">$1</ol>');

    // Paragraphs (lines not already marked up)
    const lines = html.split('\n');
    html = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('<')) return line;
        return `<p class="md-p">${trimmed}</p>`;
    }).join('\n');

    return html;
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function MarkdownPreviewer() {
    const [markdown, setMarkdown] = React.useState('');
    const [viewMode, setViewMode] = React.useState<'split' | 'preview' | 'source'>('split');
    const [copied, setCopied] = React.useState(false);

    const htmlOutput = React.useMemo(() => markdownToHtml(markdown), [markdown]);

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        setMarkdown(text);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(htmlOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadSample = () => setMarkdown(SAMPLE_MARKDOWN);

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    <Button
                        size="sm"
                        variant={viewMode === 'split' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('split')}
                        className={cn("text-xs", viewMode === 'split' && 'bg-indigo-600')}
                    >
                        <Columns className="h-3 w-3 mr-1" /> Split
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'source' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('source')}
                        className={cn("text-xs", viewMode === 'source' && 'bg-indigo-600')}
                    >
                        <Code className="h-3 w-3 mr-1" /> Source
                    </Button>
                    <Button
                        size="sm"
                        variant={viewMode === 'preview' ? 'primary' : 'ghost'}
                        onClick={() => setViewMode('preview')}
                        className={cn("text-xs", viewMode === 'preview' && 'bg-indigo-600')}
                    >
                        <Eye className="h-3 w-3 mr-1" /> Preview
                    </Button>
                </div>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={loadSample} className="text-xs">Load Sample</Button>
                    <label className="cursor-pointer inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                        <Upload className="h-3 w-3 mr-1" /> Upload .md
                        <input type="file" accept=".md,.markdown,.txt" onChange={handleFile} className="hidden" />
                    </label>
                    <Button size="sm" variant="outline" onClick={handleCopy} className="text-xs" disabled={!markdown}>
                        {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                        {copied ? 'Copied HTML!' : 'Copy HTML'}
                    </Button>
                </div>
            </div>

            {/* Editor & Preview */}
            <div className={cn(
                "grid gap-4",
                viewMode === 'split' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
            )}>
                {/* Source */}
                {(viewMode === 'split' || viewMode === 'source') && (
                    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-300 flex items-center">
                                <Code className="h-3 w-3 mr-1.5" /> Markdown Source
                            </span>
                            <span className="text-[10px] text-slate-500">{markdown.length} chars</span>
                        </div>
                        <textarea
                            value={markdown}
                            onChange={(e) => setMarkdown(e.target.value)}
                            placeholder="Type or paste Markdown here..."
                            className="w-full h-[500px] p-4 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none font-mono text-sm border-0"
                            spellCheck={false}
                        />
                    </Card>
                )}

                {/* Preview */}
                {(viewMode === 'split' || viewMode === 'preview') && (
                    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-indigo-600 px-4 py-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-white flex items-center">
                                <Eye className="h-3 w-3 mr-1.5" /> Preview
                            </span>
                        </div>
                        <div
                            className="p-6 h-[500px] overflow-auto prose prose-sm max-w-none md-preview"
                            dangerouslySetInnerHTML={{ __html: htmlOutput || '<p class="text-slate-400">Preview will appear here...</p>' }}
                        />
                    </Card>
                )}
            </div>

            {/* Markdown Preview Styles */}
            <style jsx global>{`
                .md-preview .md-h1 { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
                .md-preview .md-h2 { font-size: 1.4rem; font-weight: 700; margin: 1rem 0 0.5rem; color: #334155; }
                .md-preview .md-h3 { font-size: 1.15rem; font-weight: 600; margin: 0.75rem 0 0.25rem; color: #475569; }
                .md-preview .md-h4, .md-preview .md-h5, .md-preview .md-h6 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; color: #64748b; }
                .md-preview .md-p { margin: 0.5rem 0; line-height: 1.6; color: #334155; }
                .md-preview .md-link { color: #4f46e5; text-decoration: underline; }
                .md-preview .md-blockquote { border-left: 4px solid #a5b4fc; padding: 0.5rem 1rem; margin: 0.75rem 0; background: #eef2ff; color: #3730a3; border-radius: 0 8px 8px 0; }
                .md-preview .md-code-block { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; margin: 0.75rem 0; overflow-x: auto; font-size: 0.85rem; }
                .md-preview .md-inline-code { background: #f1f5f9; color: #be185d; padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
                .md-preview .md-ul, .md-preview .md-ol { padding-left: 1.5rem; margin: 0.5rem 0; }
                .md-preview .md-li, .md-preview .md-oli { margin: 0.25rem 0; color: #334155; }
                .md-preview .md-li-nested { margin-left: 1rem; color: #64748b; }
                .md-preview .md-ul .md-li::before { content: "•"; margin-right: 0.5rem; color: #6366f1; }
                .md-preview .md-table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
                .md-preview .md-th { padding: 0.5rem; background: #f1f5f9; border: 1px solid #e2e8f0; font-weight: 600; text-align: left; color: #334155; }
                .md-preview .md-td { padding: 0.5rem; border: 1px solid #e2e8f0; color: #475569; }
                .md-preview .md-hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5rem 0; }
                .md-preview .md-img { max-width: 100%; border-radius: 8px; margin: 0.75rem 0; }
                .md-preview del { color: #94a3b8; }
                .md-preview strong { font-weight: 700; }
                .md-preview em { font-style: italic; }
            `}</style>

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Markdown Previewer</h4>
                        <p className="text-sm text-indigo-700">
                            Write or paste Markdown to see a live preview. Supports headers, bold, italic, links, code blocks, tables, blockquotes, and lists.
                            Use Split view for side-by-side editing, or switch to Source/Preview mode.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

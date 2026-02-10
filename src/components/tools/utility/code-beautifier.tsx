'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, CheckCircle2, Sparkles } from 'lucide-react';

type Language = 'javascript' | 'css' | 'html' | 'json';

export function CodeBeautifier() {
    const [code, setCode] = React.useState('');
    const [language, setLanguage] = React.useState<Language>('javascript');
    const [beautified, setBeautified] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [indentSize, setIndentSize] = React.useState(2);

    const beautifyJs = (js: string, indent: string): string => {
        let result = '';
        let indentLevel = 0;
        let inString = false;
        let stringChar = '';

        const chars = js.replace(/\s+/g, ' ').trim().split('');

        for (let i = 0; i < chars.length; i++) {
            const char = chars[i];
            const prevChar = chars[i - 1] || '';

            // Handle strings
            if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                }
                result += char;
                continue;
            }

            if (inString) {
                result += char;
                continue;
            }

            if (char === '{' || char === '[') {
                result += char + '\n' + indent.repeat(++indentLevel);
            } else if (char === '}' || char === ']') {
                result = result.trimEnd() + '\n' + indent.repeat(--indentLevel) + char;
            } else if (char === ';') {
                result += char + '\n' + indent.repeat(indentLevel);
            } else if (char === ',') {
                result += char + '\n' + indent.repeat(indentLevel);
            } else if (char === ':') {
                result += ': ';
            } else if (char === ' ' && result.endsWith('\n')) {
                continue;
            } else {
                result += char;
            }
        }

        return result.replace(/\n\s*\n/g, '\n').trim();
    };

    const beautifyCss = (css: string, indent: string): string => {
        let result = '';
        let indentLevel = 0;

        css.replace(/\s+/g, ' ').trim().split('').forEach(char => {
            if (char === '{') {
                result += ' {\n' + indent.repeat(++indentLevel);
            } else if (char === '}') {
                result = result.trimEnd() + '\n' + indent.repeat(--indentLevel) + '}\n';
            } else if (char === ';') {
                result += ';\n' + indent.repeat(indentLevel);
            } else {
                result += char;
            }
        });

        return result.replace(/\n\s*\n/g, '\n').trim();
    };

    const beautifyHtml = (html: string, indent: string): string => {
        const selfClosing = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
        let result = '';
        let indentLevel = 0;

        const tokens = html.replace(/>\s*</g, '>\n<').split('\n');

        tokens.forEach(token => {
            token = token.trim();
            if (!token) return;

            if (token.startsWith('</')) {
                indentLevel = Math.max(0, indentLevel - 1);
                result += indent.repeat(indentLevel) + token + '\n';
            } else if (token.startsWith('<') && !token.startsWith('<!')) {
                result += indent.repeat(indentLevel) + token + '\n';
                const tagMatch = token.match(/<(\w+)/);
                const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
                if (!token.endsWith('/>') && !selfClosing.includes(tagName)) {
                    indentLevel++;
                }
            } else {
                result += indent.repeat(indentLevel) + token + '\n';
            }
        });

        return result.trim();
    };

    const beautifyJson = (json: string, indentSize: number): string => {
        try {
            const parsed = JSON.parse(json);
            return JSON.stringify(parsed, null, indentSize);
        } catch {
            return 'Invalid JSON';
        }
    };

    const handleBeautify = () => {
        const indent = ' '.repeat(indentSize);
        let result = '';

        switch (language) {
            case 'javascript':
                result = beautifyJs(code, indent);
                break;
            case 'css':
                result = beautifyCss(code, indent);
                break;
            case 'html':
                result = beautifyHtml(code, indent);
                break;
            case 'json':
                result = beautifyJson(code, indentSize);
                break;
        }

        setBeautified(result);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(beautified);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadBeautified = () => {
        const extensions: Record<Language, string> = {
            javascript: 'js',
            css: 'css',
            html: 'html',
            json: 'json'
        };
        const blob = new Blob([beautified], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `beautified.${extensions[language]}`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getCodeColor = () => {
        switch (language) {
            case 'javascript': return 'text-emerald-400';
            case 'css': return 'text-cyan-400';
            case 'html': return 'text-orange-400';
            case 'json': return 'text-amber-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Settings */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="css">CSS</option>
                            <option value="html">HTML</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Indent Size</label>
                        <select
                            value={indentSize}
                            onChange={(e) => setIndentSize(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-900"
                        >
                            <option value={2}>2 Spaces</option>
                            <option value={4}>4 Spaces</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">Code Input</label>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your minified code here..."
                    className="w-full h-40 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </Card>

            {/* Beautify Button */}
            <Button
                onClick={handleBeautify}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
                disabled={!code.trim()}
            >
                <Sparkles className="h-5 w-5 mr-2" />
                Beautify Code
            </Button>

            {/* Output */}
            {beautified && (
                <Card className="p-4 bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-300">Beautified Output</span>
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
                                onClick={downloadBeautified}
                                className="text-slate-400 hover:text-white"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-72 overflow-auto">
                        <pre className={`text-xs font-mono whitespace-pre ${getCodeColor()}`}>{beautified}</pre>
                    </div>
                </Card>
            )}
        </div>
    );
}

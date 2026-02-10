'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, CheckCircle2, Minimize2 } from 'lucide-react';

export function CssMinifier() {
    const [code, setCode] = React.useState('');
    const [minified, setMinified] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [stats, setStats] = React.useState({ original: 0, minified: 0, saved: 0 });

    const minifyCss = (css: string): string => {
        return css
            // Remove comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            // Remove space around special characters
            .replace(/\s*([{}:;,>+~])\s*/g, '$1')
            // Remove semicolon before closing brace
            .replace(/;}/g, '}')
            // Remove leading zeros from decimals
            .replace(/:0\./g, ':.')
            // Remove units from zero values
            .replace(/(\s|:)0(px|em|rem|%|pt|cm|mm|in|pc|ex|ch)/g, '$10')
            .trim();
    };

    const handleMinify = () => {
        const result = minifyCss(code);
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
        const blob = new Blob([minified], { type: 'text/css' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'styles.min.css';
        a.click();
        URL.revokeObjectURL(url);
    };

    const sampleCode = `/* Main container styles */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0px 20px;
}

/* Button component */
.button {
    display: inline-block;
    padding: 10px 20px;
    background-color: #007bff;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.button:hover {
    background-color: #0056b3;
}

/* Text utilities */
.text-center {
    text-align: center;
}

.text-bold {
    font-weight: bold;
}`;

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">CSS Code</label>
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
                    placeholder="Paste your CSS code here..."
                    className="w-full h-56 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-cyan-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                Minify CSS
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
                        <pre className="text-xs text-cyan-400 font-mono whitespace-pre-wrap break-all">{minified}</pre>
                    </div>
                </Card>
            )}
        </div>
    );
}

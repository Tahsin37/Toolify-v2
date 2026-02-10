'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Code, Copy, Download, CheckCircle2, Minimize2 } from 'lucide-react';

export function JsMinifier() {
    const [code, setCode] = React.useState('');
    const [minified, setMinified] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [stats, setStats] = React.useState({ original: 0, minified: 0, saved: 0 });

    const minifyJs = (js: string): string => {
        return js
            // Remove single-line comments
            .replace(/\/\/[^\n]*/g, '')
            // Remove multi-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '')
            // Remove extra whitespace but preserve strings
            .split(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/)
            .map((part, i) => {
                if (i % 2 === 0) {
                    // Not a string, safe to minify
                    return part
                        .replace(/\s+/g, ' ')
                        .replace(/\s*([{}();,:])\s*/g, '$1')
                        .replace(/\s*([+\-*/%=<>!&|?])\s*/g, '$1')
                        .trim();
                }
                return part; // Preserve strings
            })
            .join('')
            // Remove leading/trailing whitespace from lines
            .split('\n')
            .map(line => line.trim())
            .filter(line => line)
            .join('');
    };

    const handleMinify = () => {
        const result = minifyJs(code);
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
        const blob = new Blob([minified], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'script.min.js';
        a.click();
        URL.revokeObjectURL(url);
    };

    const sampleCode = `// This is a sample JavaScript file
function calculateSum(numbers) {
    // Initialize sum to zero
    let sum = 0;
    
    /* Loop through all numbers
       and add them up */
    for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
    }
    
    return sum;
}

// Example usage
const myNumbers = [1, 2, 3, 4, 5];
console.log("The sum is: " + calculateSum(myNumbers));`;

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">JavaScript Code</label>
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
                    placeholder="Paste your JavaScript code here..."
                    className="w-full h-56 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                Minify JavaScript
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
                        <pre className="text-xs text-amber-400 font-mono whitespace-pre-wrap break-all">{minified}</pre>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">What gets removed?</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Comments (single-line and multi-line)</li>
                    <li>• Unnecessary whitespace and newlines</li>
                    <li>• Extra spaces around operators and punctuation</li>
                </ul>
            </Card>
        </div>
    );
}

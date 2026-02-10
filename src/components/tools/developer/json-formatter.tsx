'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Copy, FileJson, Check, AlertTriangle } from 'lucide-react';

export function JsonFormatter() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [error, setError] = React.useState<string | null>(null);
    const [copied, setCopied] = React.useState(false);

    const handleFormat = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            const formatted = JSON.stringify(parsed, null, 2);
            setOutput(formatted);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleMinify = () => {
        try {
            if (!input.trim()) {
                setOutput('');
                setError(null);
                return;
            }
            const parsed = JSON.parse(input);
            const minified = JSON.stringify(parsed);
            setOutput(minified);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px]">
            {/* Input */}
            <div className="flex flex-col h-full space-y-3">
                <label className="text-sm font-medium text-slate-700">Input JSON</label>
                <Card className="flex-1 bg-white border border-slate-200 p-0 flex flex-col overflow-hidden shadow-sm">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste your JSON here..."
                        className="flex-1 border-0 rounded-none font-mono text-sm resize-none p-4 focus-visible:ring-0 text-slate-900 placeholder:text-slate-400 bg-white"
                    />
                </Card>
            </div>

            {/* Controls (Mobile only, desktop uses middle gap or toolbar) */}
            <div className="lg:hidden flex gap-2">
                <Button onClick={handleFormat} className="flex-1">Format</Button>
                <Button onClick={handleMinify} variant="secondary" className="flex-1">Minify</Button>
            </div>

            {/* Output */}
            <div className="flex flex-col h-full space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-slate-700">Result</label>
                    <div className="flex space-x-2">
                        <Button size="sm" onClick={handleFormat} className="hidden lg:inline-flex bg-indigo-600 hover:bg-indigo-700 text-white">Format</Button>
                        <Button size="sm" variant="secondary" onClick={handleMinify} className="hidden lg:inline-flex bg-indigo-50 text-indigo-700 hover:bg-indigo-100">Minify</Button>
                        <Button size="sm" variant="outline" onClick={handleCopy} disabled={!output} className="border-slate-200 hover:bg-slate-50">
                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copied ? 'Copied' : 'Copy'}
                        </Button>
                    </div>
                </div>

                <Card className={cn(
                    "flex-1 bg-slate-50 border border-slate-200 p-0 flex flex-col overflow-hidden relative shadow-inner",
                    error && "border-rose-300 bg-rose-50"
                )}>
                    {error ? (
                        <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-center">
                            <div className="bg-white p-3 rounded-full shadow-sm mb-4">
                                <AlertTriangle className="h-8 w-8 text-rose-500" />
                            </div>
                            <h3 className="text-lg font-bold text-rose-600 mb-2">Invalid JSON</h3>
                            <p className="text-rose-500 font-mono text-xs bg-white/50 px-4 py-2 rounded-md border border-rose-100 max-w-full overflow-hidden text-ellipsis">
                                {error}
                            </p>
                        </div>
                    ) : (
                        <Textarea
                            value={output}
                            readOnly
                            placeholder="Result will appear here..."
                            className="flex-1 border-0 rounded-none font-mono text-sm resize-none p-4 focus-visible:ring-0 text-emerald-700 bg-transparent placeholder:text-slate-400"
                        />
                    )}
                </Card>
            </div>
        </div>
    );
}

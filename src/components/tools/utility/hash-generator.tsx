'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Hash, Copy, CheckCircle2, Info, FileText, Upload, Loader2
} from 'lucide-react';

interface HashResult {
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
}

export function HashGenerator() {
    const [input, setInput] = React.useState('');
    const [result, setResult] = React.useState<HashResult | null>(null);
    const [mode, setMode] = React.useState<'text' | 'file'>('text');
    const [loading, setLoading] = React.useState(false);
    const [fileName, setFileName] = React.useState('');
    const [copied, setCopied] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const hashText = async (text: string): Promise<HashResult> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        return hashData(data);
    };

    const hashData = async (data: Uint8Array): Promise<HashResult> => {
        const toHex = (buffer: ArrayBuffer) =>
            Array.from(new Uint8Array(buffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

        // MD5 requires a library, we'll use a simple implementation
        const md5 = await computeMD5(data);

        const [sha1, sha256, sha512] = await Promise.all([
            crypto.subtle.digest('SHA-1', data.buffer as ArrayBuffer).then(toHex),
            crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer).then(toHex),
            crypto.subtle.digest('SHA-512', data.buffer as ArrayBuffer).then(toHex),
        ]);

        return { md5, sha1, sha256, sha512 };
    };

    // MD5 using js-md5 library
    const computeMD5 = async (data: Uint8Array): Promise<string> => {
        const { md5 } = await import('js-md5');
        return md5(Array.from(data));
    };

    const generateHashes = async () => {
        if (!input.trim()) return;
        setLoading(true);
        try {
            const hashes = await hashText(input);
            setResult(hashes);
        } catch (err) {
            console.error('Hash error:', err);
        }
        setLoading(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setFileName(file.name);

        try {
            const buffer = await file.arrayBuffer();
            const data = new Uint8Array(buffer);
            const hashes = await hashData(data);
            setResult(hashes);
        } catch (err) {
            console.error('File hash error:', err);
        }

        setLoading(false);
    };

    const copyHash = async (type: string, value: string) => {
        await navigator.clipboard.writeText(value);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const hashTypes = [
        { key: 'md5', label: 'MD5', bits: 128 },
        { key: 'sha1', label: 'SHA-1', bits: 160 },
        { key: 'sha256', label: 'SHA-256', bits: 256 },
        { key: 'sha512', label: 'SHA-512', bits: 512 },
    ];

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex gap-2">
                    <Button
                        variant={mode === 'text' ? 'primary' : 'outline'}
                        onClick={() => { setMode('text'); setResult(null); setFileName(''); }}
                        className="flex-1"
                    >
                        <FileText className="h-4 w-4 mr-2" />
                        Text Input
                    </Button>
                    <Button
                        variant={mode === 'file' ? 'primary' : 'outline'}
                        onClick={() => { setMode('file'); setResult(null); setInput(''); }}
                        className="flex-1"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        File Input
                    </Button>
                </div>
            </Card>

            {/* Text Input */}
            {mode === 'text' && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <Hash className="h-4 w-4 mr-2 text-indigo-500" />
                        Enter Text to Hash
                    </h3>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter text to generate hashes..."
                        className="w-full h-32 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <Button
                        onClick={generateHashes}
                        disabled={loading || !input.trim()}
                        className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700"
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Hash className="h-4 w-4 mr-2" />
                        )}
                        Generate Hashes
                    </Button>
                </Card>
            )}

            {/* File Input */}
            {mode === 'file' && (
                <Card
                    className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-indigo-50/30 hover:border-indigo-400 transition-all cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                            {loading ? (
                                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                            ) : (
                                <Upload className="h-8 w-8 text-indigo-600" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            {fileName || 'Upload File to Hash'}
                        </h3>
                        <p className="text-sm text-slate-500">Any file type supported</p>
                    </div>
                </Card>
            )}

            {/* Results */}
            {result && (
                <Card className="p-5 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                        Hash Results
                    </h3>
                    <div className="space-y-3">
                        {hashTypes.map(({ key, label, bits }) => (
                            <div key={key} className="p-3 bg-slate-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-slate-600">{label} ({bits}-bit)</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyHash(key, result[key as keyof HashResult])}
                                    >
                                        {copied === key ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="font-mono text-xs text-slate-800 break-all">
                                    {result[key as keyof HashResult]}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Hash Generator</h4>
                        <p className="text-sm text-indigo-700">
                            Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from text or files.
                            All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Copy, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export function JsonToCsv() {
    const [jsonInput, setJsonInput] = React.useState('');
    const [csv, setCsv] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setJsonInput(event.target?.result as string);
                setError('');
            };
            reader.readAsText(file);
        }
    };

    const convert = () => {
        try {
            if (!jsonInput.trim()) {
                setError('Please enter JSON data');
                return;
            }

            const data = JSON.parse(jsonInput);

            if (!Array.isArray(data)) {
                setError('JSON must be an array of objects');
                return;
            }

            if (data.length === 0) {
                setError('JSON array is empty');
                return;
            }

            // Get all unique headers from all objects
            const headers = new Set<string>();
            data.forEach(item => {
                if (typeof item === 'object' && item !== null) {
                    Object.keys(item).forEach(key => headers.add(key));
                }
            });

            const headerArray = Array.from(headers);

            // Build CSV
            const rows: string[] = [];
            rows.push(headerArray.map(h => escapeCSV(h)).join(','));

            data.forEach(item => {
                const row = headerArray.map(header => {
                    const value = item[header];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') return escapeCSV(JSON.stringify(value));
                    return escapeCSV(String(value));
                });
                rows.push(row.join(','));
            });

            setCsv(rows.join('\n'));
            setError('');
        } catch (err) {
            setError('Failed to parse JSON. Please check the format.');
        }
    };

    const escapeCSV = (value: string): string => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(csv);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadCsv = () => {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* File Upload */}
            <Card
                className="p-6 border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Drop JSON file or click to browse</p>
            </Card>

            {/* JSON Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-3">JSON Input (array of objects)</h3>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder={'[\n  {"name": "John", "email": "john@example.com", "age": 30},\n  {"name": "Jane", "email": "jane@example.com", "age": 25}\n]'}
                    className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </Card>

            {/* Convert Button */}
            <Button
                onClick={convert}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                Convert to CSV
            </Button>

            {/* Error */}
            {error && (
                <Card className="p-4 bg-rose-50 border border-rose-200">
                    <p className="text-sm text-rose-700">{error}</p>
                </Card>
            )}

            {/* CSV Output */}
            {csv && (
                <Card className="p-4 bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-300">CSV Output</h3>
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
                                onClick={downloadCsv}
                                className="text-slate-400 hover:text-white"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{csv}</pre>
                    </div>
                </Card>
            )}
        </div>
    );
}

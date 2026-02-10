'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Copy, FileJson, CheckCircle2 } from 'lucide-react';

export function CsvToJson() {
    const [csv, setCsv] = React.useState('');
    const [json, setJson] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCsv(event.target?.result as string);
                setError('');
            };
            reader.readAsText(file);
        }
    };

    const convert = () => {
        try {
            if (!csv.trim()) {
                setError('Please enter CSV data');
                return;
            }

            const lines = csv.trim().split('\n');
            if (lines.length < 2) {
                setError('CSV must have at least a header row and one data row');
                return;
            }

            const headers = parseCSVLine(lines[0]);
            const result: Record<string, string>[] = [];

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = parseCSVLine(lines[i]);
                    const row: Record<string, string> = {};
                    headers.forEach((header, index) => {
                        row[header.trim()] = values[index]?.trim() || '';
                    });
                    result.push(row);
                }
            }

            setJson(JSON.stringify(result, null, 2));
            setError('');
        } catch (err) {
            setError('Failed to parse CSV. Please check the format.');
        }
    };

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadJson = () => {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'converted.json';
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
                    accept=".csv,text/csv"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Drop CSV file or click to browse</p>
            </Card>

            {/* CSV Input */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-3">CSV Input</h3>
                <textarea
                    value={csv}
                    onChange={(e) => setCsv(e.target.value)}
                    placeholder="name,email,age&#10;John,john@example.com,30&#10;Jane,jane@example.com,25"
                    className="w-full h-48 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </Card>

            {/* Convert Button */}
            <Button
                onClick={convert}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
                <FileJson className="h-5 w-5 mr-2" />
                Convert to JSON
            </Button>

            {/* Error */}
            {error && (
                <Card className="p-4 bg-rose-50 border border-rose-200">
                    <p className="text-sm text-rose-700">{error}</p>
                </Card>
            )}

            {/* JSON Output */}
            {json && (
                <Card className="p-4 bg-slate-900 border border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-300">JSON Output</h3>
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
                                onClick={downloadJson}
                                className="text-slate-400 hover:text-white"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="bg-slate-800 rounded-lg p-4 max-h-64 overflow-auto">
                        <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">{json}</pre>
                    </div>
                </Card>
            )}
        </div>
    );
}

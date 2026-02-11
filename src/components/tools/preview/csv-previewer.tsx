'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText, Upload, Search, Download, Info, Loader2, X
} from 'lucide-react';

interface CSVData {
    headers: string[];
    rows: string[][];
}

export function CsvPreviewer() {
    const [csvData, setCsvData] = React.useState<CSVData | null>(null);
    const [fileName, setFileName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const parseCSV = (text: string): CSVData => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) throw new Error('Empty CSV file');

        const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                const nextChar = line[i + 1];

                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        current += '"';
                        i++; // Skip next quote
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            result.push(current.trim());
            return result;
        };

        const headers = parseCSVLine(lines[0]);
        const rows = lines.slice(1).map(line => parseCSVLine(line));

        return { headers, rows };
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        setLoading(true);
        setError('');
        setFileName(file.name);

        try {
            const text = await file.text();
            const data = parseCSV(text);
            setCsvData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse CSV');
            setCsvData(null);
        }

        setLoading(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        setLoading(true);
        setError('');
        setFileName(file.name);

        try {
            const text = await file.text();
            const data = parseCSV(text);
            setCsvData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse CSV');
            setCsvData(null);
        }

        setLoading(false);
    };

    const filteredRows = React.useMemo(() => {
        if (!csvData || !searchTerm) return csvData?.rows || [];

        const term = searchTerm.toLowerCase();
        return csvData.rows.filter(row =>
            row.some(cell => cell.toLowerCase().includes(term))
        );
    }, [csvData, searchTerm]);

    const downloadCSV = () => {
        if (!csvData) return;

        const csvContent = [
            csvData.headers.join(','),
            ...filteredRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = searchTerm ? `filtered_${fileName}` : fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearData = () => {
        setCsvData(null);
        setFileName('');
        setSearchTerm('');
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            {!csvData && (
                <Card
                    className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-emerald-50/30 hover:border-emerald-400 transition-all cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                            {loading ? (
                                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                            ) : (
                                <FileText className="h-8 w-8 text-emerald-600" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            Upload CSV File
                        </h3>
                        <p className="text-sm text-slate-500">Drop file here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-2">Supports .csv files</p>
                    </div>
                </Card>
            )}

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{error}</p>
                </Card>
            )}

            {/* CSV Preview */}
            {csvData && (
                <>
                    {/* Toolbar */}
                    <Card className="p-4 bg-white border border-slate-200">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 flex-1">
                                <FileText className="h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="font-medium text-slate-800 text-sm">{fileName}</p>
                                    <p className="text-xs text-slate-500">
                                        {filteredRows.length} rows × {csvData.headers.length} columns
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-8 h-9 w-64"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadCSV}
                                >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearData}
                                >
                                    <Upload className="h-4 w-4 mr-1" />
                                    New
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Table */}
                    <Card className="p-0 bg-white border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        {csvData.headers.map((header, i) => (
                                            <th
                                                key={i}
                                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {header || `Column ${i + 1}`}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {filteredRows.length > 0 ? (
                                        filteredRows.map((row, rowIndex) => (
                                            <tr
                                                key={rowIndex}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                {row.map((cell, cellIndex) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap"
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={csvData.headers.length}
                                                className="px-4 py-8 text-center text-slate-500"
                                            >
                                                No results found for "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </>
            )}

            {/* Info */}
            <Card className="p-4 bg-emerald-50 border border-emerald-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-emerald-800 mb-1">CSV Previewer</h4>
                        <p className="text-sm text-emerald-700">
                            Preview CSV files in a clean table format. Search through data and download
                            filtered results. All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Upload, Download, FileText, ArrowRight, FileSpreadsheet,
    CheckCircle2, AlertTriangle, Loader2, File, Table,
    Trash2, Plus, Settings
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ConversionResult {
    filename: string;
    blob: Blob;
    size: number;
}

export function CsvToXlsx() {
    const [files, setFiles] = React.useState<File[]>([]);
    const [converting, setConverting] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [results, setResults] = React.useState<ConversionResult[]>([]);
    const [error, setError] = React.useState('');
    const [sheetName, setSheetName] = React.useState('Sheet1');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            f => f.name.endsWith('.csv') || f.type === 'text/csv'
        );
        if (droppedFiles.length > 0) {
            setFiles(prev => [...prev, ...droppedFiles]);
            setError('');
        } else {
            setError('Please drop CSV files only');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        setFiles(prev => [...prev, ...selectedFiles]);
        setError('');
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setFiles([]);
        setResults([]);
        setError('');
        setProgress(0);
    };

    const convertFiles = async () => {
        if (files.length === 0) return;

        setConverting(true);
        setProgress(0);
        setResults([]);
        setError('');

        try {
            const converted: ConversionResult[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const text = await file.text();
                setProgress(Math.round(((i + 0.5) / files.length) * 100));

                // Parse CSV
                const rows = text.split('\n').map(row => {
                    // Handle quoted values and commas
                    const result: string[] = [];
                    let current = '';
                    let inQuotes = false;

                    for (const char of row) {
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ',' && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
                    return result;
                }).filter(row => row.some(cell => cell.length > 0));

                // Create workbook
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.aoa_to_sheet(rows);

                // Auto-width columns
                const colWidths = rows[0]?.map((_, colIndex) => {
                    const maxWidth = Math.max(
                        ...rows.map(row => (row[colIndex] || '').toString().length)
                    );
                    return { wch: Math.min(Math.max(maxWidth, 10), 50) };
                }) || [];
                worksheet['!cols'] = colWidths;

                XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

                // Generate Excel file
                const excelBuffer = XLSX.write(workbook, {
                    bookType: 'xlsx',
                    type: 'array'
                });

                const blob = new Blob([excelBuffer], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });

                const baseName = file.name.replace(/\.csv$/i, '');
                converted.push({
                    filename: `${baseName}.xlsx`,
                    blob,
                    size: blob.size
                });

                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            setResults(converted);
        } catch (err) {
            console.error('Conversion error:', err);
            setError('Failed to convert one or more files. Please check the CSV format.');
        }

        setConverting(false);
    };

    const downloadResult = (result: ConversionResult) => {
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const downloadAll = () => {
        results.forEach(result => downloadResult(result));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-emerald-50/30 hover:border-emerald-400 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                        <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Drop CSV files here
                    </h3>
                    <p className="text-sm text-slate-500">or click to browse</p>
                </div>
            </Card>

            {/* Settings */}
            {files.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center gap-4">
                        <Settings className="h-5 w-5 text-slate-400" />
                        <div className="flex-1">
                            <label className="text-sm font-medium text-slate-700">Sheet Name</label>
                            <Input
                                value={sheetName}
                                onChange={(e) => setSheetName(e.target.value)}
                                placeholder="Sheet1"
                                className="mt-1"
                            />
                        </div>
                    </div>
                </Card>
            )}

            {/* File List */}
            {files.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-800">Files to Convert ({files.length})</h3>
                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500">
                            <Trash2 className="h-4 w-4 mr-1" /> Clear All
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Table className="h-4 w-4 text-emerald-500" />
                                    <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                                    <span className="text-xs text-slate-400">{formatSize(file.size)}</span>
                                </div>
                                <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Convert Button */}
            {files.length > 0 && results.length === 0 && (
                <Button
                    onClick={convertFiles}
                    disabled={converting}
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                >
                    {converting ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Converting... {progress}%
                        </>
                    ) : (
                        <>
                            <ArrowRight className="h-5 w-5 mr-2" />
                            Convert to Excel ({files.length} files)
                        </>
                    )}
                </Button>
            )}

            {/* Progress */}
            {converting && (
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <Card className="p-4 bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            <h3 className="font-semibold text-emerald-800">Conversion Complete!</h3>
                        </div>
                        {results.length > 1 && (
                            <Button size="sm" onClick={downloadAll} className="bg-emerald-600 hover:bg-emerald-700">
                                <Download className="h-4 w-4 mr-1" /> Download All
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {results.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                                    <span className="font-medium text-slate-800">{result.filename}</span>
                                    <span className="text-xs text-slate-500">{formatSize(result.size)}</span>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => downloadResult(result)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                </Card>
            )}
        </div>
    );
}

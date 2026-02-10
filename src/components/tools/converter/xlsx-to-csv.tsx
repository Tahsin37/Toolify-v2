'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Upload, Download, FileSpreadsheet, ArrowRight, FileText,
    CheckCircle2, AlertTriangle, Loader2, Table, Trash2, Settings
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ConversionResult {
    filename: string;
    content: string;
    size: number;
}

export function XlsxToCsv() {
    const [files, setFiles] = React.useState<File[]>([]);
    const [converting, setConverting] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [results, setResults] = React.useState<ConversionResult[]>([]);
    const [error, setError] = React.useState('');
    const [selectedSheet, setSelectedSheet] = React.useState(0);
    const [sheetNames, setSheetNames] = React.useState<string[][]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(
            f => f.name.endsWith('.xlsx') || f.name.endsWith('.xls')
        );
        if (droppedFiles.length > 0) {
            processFiles(droppedFiles);
        } else {
            setError('Please drop Excel files (.xlsx, .xls) only');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        processFiles(selectedFiles);
    };

    const processFiles = async (newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles]);
        setError('');

        // Get sheet names for each file
        const allSheetNames: string[][] = [];
        for (const file of newFiles) {
            try {
                const data = await file.arrayBuffer();
                const workbook = XLSX.read(data);
                allSheetNames.push(workbook.SheetNames);
            } catch {
                allSheetNames.push(['Sheet1']);
            }
        }
        setSheetNames(prev => [...prev, ...allSheetNames]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setSheetNames(prev => prev.filter((_, i) => i !== index));
    };

    const clearAll = () => {
        setFiles([]);
        setResults([]);
        setSheetNames([]);
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
                const data = await file.arrayBuffer();
                setProgress(Math.round(((i + 0.3) / files.length) * 100));

                const workbook = XLSX.read(data);
                const sheetName = workbook.SheetNames[selectedSheet] || workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to CSV
                const csv = XLSX.utils.sheet_to_csv(worksheet);

                const baseName = file.name.replace(/\.(xlsx|xls)$/i, '');
                converted.push({
                    filename: `${baseName}_${sheetName}.csv`,
                    content: csv,
                    size: new Blob([csv]).size
                });

                setProgress(Math.round(((i + 1) / files.length) * 100));
            }

            setResults(converted);
        } catch (err) {
            console.error('Conversion error:', err);
            setError('Failed to convert one or more files.');
        }

        setConverting(false);
    };

    const downloadResult = (result: ConversionResult) => {
        const blob = new Blob([result.content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
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
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-blue-50/30 hover:border-blue-400 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Drop Excel files here
                    </h3>
                    <p className="text-sm text-slate-500">Supports .xlsx and .xls formats</p>
                </div>
            </Card>

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
                                    <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-slate-700 truncate max-w-xs">{file.name}</span>
                                    {sheetNames[index] && sheetNames[index].length > 1 && (
                                        <span className="text-xs text-blue-500 bg-blue-100 px-2 py-0.5 rounded">
                                            {sheetNames[index].length} sheets
                                        </span>
                                    )}
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
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                >
                    {converting ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Converting... {progress}%
                        </>
                    ) : (
                        <>
                            <ArrowRight className="h-5 w-5 mr-2" />
                            Convert to CSV ({files.length} files)
                        </>
                    )}
                </Button>
            )}

            {/* Progress */}
            {converting && (
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Results */}
            {results.length > 0 && (
                <Card className="p-4 bg-blue-50 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-blue-800">Conversion Complete!</h3>
                        </div>
                        {results.length > 1 && (
                            <Button size="sm" onClick={downloadAll} className="bg-blue-600 hover:bg-blue-700">
                                <Download className="h-4 w-4 mr-1" /> Download All
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2">
                        {results.map((result, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <Table className="h-5 w-5 text-blue-600" />
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

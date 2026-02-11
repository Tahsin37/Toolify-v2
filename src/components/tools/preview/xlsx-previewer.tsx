'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileSpreadsheet, Upload, Search, Download, Info, Loader2, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface SheetData {
    name: string;
    headers: string[];
    rows: (string | number)[][];
}

export function XlsxPreviewer() {
    const [sheets, setSheets] = React.useState<SheetData[]>([]);
    const [activeSheet, setActiveSheet] = React.useState(0);
    const [fileName, setFileName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [error, setError] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const parseExcel = async (file: File): Promise<SheetData[]> => {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });

        return workbook.SheetNames.map(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length === 0) {
                return { name: sheetName, headers: [], rows: [] };
            }

            const headers = jsonData[0].map((h: any) => String(h || ''));
            const rows = jsonData.slice(1).map(row =>
                headers.map((_, i) => {
                    const cell = row[i];
                    return cell !== undefined && cell !== null ? cell : '';
                })
            );

            return { name: sheetName, headers, rows };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validExtensions = ['.xlsx', '.xls', '.xlsm'];
        const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!hasValidExt) {
            setError('Please upload an Excel file (.xlsx, .xls, or .xlsm)');
            return;
        }

        setLoading(true);
        setError('');
        setFileName(file.name);
        setActiveSheet(0);

        try {
            const sheetData = await parseExcel(file);
            setSheets(sheetData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
            setSheets([]);
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
        const validExtensions = ['.xlsx', '.xls', '.xlsm'];
        const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

        if (!hasValidExt) {
            setError('Please upload an Excel file (.xlsx, .xls, or .xlsm)');
            return;
        }

        setLoading(true);
        setError('');
        setFileName(file.name);
        setActiveSheet(0);

        try {
            const sheetData = await parseExcel(file);
            setSheets(sheetData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
            setSheets([]);
        }

        setLoading(false);
    };

    const currentSheet = sheets[activeSheet];

    const filteredRows = React.useMemo(() => {
        if (!currentSheet || !searchTerm) return currentSheet?.rows || [];

        const term = searchTerm.toLowerCase();
        return currentSheet.rows.filter(row =>
            row.some(cell => String(cell).toLowerCase().includes(term))
        );
    }, [currentSheet, searchTerm]);

    const downloadCSV = () => {
        if (!currentSheet) return;

        const csvContent = [
            currentSheet.headers.join(','),
            ...filteredRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace(/\.(xlsx|xls|xlsm)$/i, '')}_${currentSheet.name}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearData = () => {
        setSheets([]);
        setFileName('');
        setSearchTerm('');
        setError('');
        setActiveSheet(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            {sheets.length === 0 && (
                <Card
                    className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-green-50/30 hover:border-green-400 transition-all cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.xlsm"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                            {loading ? (
                                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                            ) : (
                                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            Upload Excel File
                        </h3>
                        <p className="text-sm text-slate-500">Drop file here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-2">Supports .xlsx, .xls, .xlsm files</p>
                    </div>
                </Card>
            )}

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{error}</p>
                </Card>
            )}

            {/* Excel Preview */}
            {sheets.length > 0 && currentSheet && (
                <>
                    {/* Toolbar */}
                    <Card className="p-4 bg-white border border-slate-200">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-slate-800 text-sm">{fileName}</p>
                                    <p className="text-xs text-slate-500">
                                        {sheets.length} sheet{sheets.length > 1 ? 's' : ''} • {filteredRows.length} rows × {currentSheet.headers.length} columns
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
                                    CSV
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

                    {/* Sheet Tabs */}
                    {sheets.length > 1 && (
                        <Card className="p-2 bg-white border border-slate-200">
                            <div className="flex items-center gap-1 overflow-x-auto">
                                {sheets.map((sheet, index) => (
                                    <Button
                                        key={index}
                                        variant={activeSheet === index ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveSheet(index)}
                                        className="whitespace-nowrap"
                                    >
                                        {sheet.name}
                                    </Button>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Table */}
                    <Card className="p-0 bg-white border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        {currentSheet.headers.map((header, i) => (
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
                                                        {String(cell)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={currentSheet.headers.length}
                                                className="px-4 py-8 text-center text-slate-500"
                                            >
                                                {searchTerm ? `No results found for "${searchTerm}"` : 'Empty sheet'}
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
            <Card className="p-4 bg-green-50 border border-green-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-green-800 mb-1">Excel Previewer</h4>
                        <p className="text-sm text-green-700">
                            Preview Excel files with multi-sheet support. Switch between sheets, search data,
                            and export individual sheets as CSV. All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

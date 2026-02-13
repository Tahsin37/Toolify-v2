'use client';

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, File, X, ArrowUp, ArrowDown, Layers, Loader2 } from 'lucide-react';

export function PdfMerge() {
    const [files, setFiles] = useState<File[]>([]);
    const [merging, setMerging] = useState(false);
    const [resultUrl, setResultUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
            setResultUrl(null);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setResultUrl(null);
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === files.length - 1)
        ) return;

        const newFiles = [...files];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newFiles[index], newFiles[swapIndex]] = [newFiles[swapIndex], newFiles[index]];
        setFiles(newFiles);
        setResultUrl(null);
    };

    const mergePDFs = async () => {
        if (files.length < 2) return;
        setMerging(true);

        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const arrayBuffer = await file.arrayBuffer() as ArrayBuffer;
                const pdf = await PDFDocument.load(arrayBuffer);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const pdfBytes = await mergedPdf.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
        } catch (err) {
            console.error('Merge failed:', err);
            alert('Failed to merge PDFs. Some files might be encrypted or corrupted.');
        } finally {
            setMerging(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Merge PDF Files</h1>
                <p className="text-slate-500">Combine multiple PDF files into one document. Drag and drop to reorder.</p>
            </div>

            <Card className="p-8 border-dashed border-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-indigo-100 rounded-full">
                        <Layers className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                        <input
                            type="file"
                            accept=".pdf"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="pdf-upload"
                        />
                        <label
                            htmlFor="pdf-upload"
                            className="cursor-pointer inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Upload className="mr-2 h-5 w-5" />
                            Select PDF Files
                        </label>
                    </div>
                    <p className="text-sm text-slate-500">or drag and drop PDF files here</p>
                </div>
            </Card>

            {files.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Files to Merge ({files.length})</h2>
                        <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setFiles([])}>
                            Clear All
                        </Button>
                    </div>

                    <div className="grid gap-3">
                        {files.map((file, index) => (
                            <Card key={`${file.name}-${index}`} className="p-4 flex items-center justify-between bg-white">
                                <div className="flex items-center space-x-4 overflow-hidden">
                                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                                        <File className="w-4 h-4 text-red-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => moveFile(index, 'up')}
                                        disabled={index === 0}
                                        className="h-8 w-8"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => moveFile(index, 'down')}
                                        disabled={index === files.length - 1}
                                        className="h-8 w-8"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => removeFile(index)}
                                        className="h-8 w-8 text-slate-400 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="flex justify-center pt-4">
                        {resultUrl ? (
                            <a href={resultUrl} download="merged.pdf" className="w-full sm:w-auto">
                                <Button className="w-full sm:min-w-[200px] h-12 bg-green-600 hover:bg-green-700">
                                    <Download className="mr-2 h-5 w-5" />
                                    Download Merged PDF
                                </Button>
                            </a>
                        ) : (
                            <Button
                                onClick={mergePDFs}
                                disabled={merging || files.length < 2}
                                className="w-full sm:w-auto min-w-[200px] h-12 bg-indigo-600 hover:bg-indigo-700"
                            >
                                {merging ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Merging...
                                    </>
                                ) : (
                                    <>
                                        <Layers className="mr-2 h-5 w-5" />
                                        Merge PDFs
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

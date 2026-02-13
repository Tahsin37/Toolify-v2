'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, Download, GripVertical, Trash2, Loader2, Info, LayoutGrid } from 'lucide-react';

interface PageInfo {
    index: number;
    thumbnail: string | null;
    width: number;
    height: number;
    selected: boolean;
}

export function PdfOrganize() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const pdfBytesRef = useRef<ArrayBuffer | null>(null);

    const handleFile = useCallback(async (f: File) => {
        if (f.type !== 'application/pdf') return;
        setFile(f);
        setLoading(true);

        try {
            const arrayBuffer = await f.arrayBuffer() as ArrayBuffer;
            pdfBytesRef.current = arrayBuffer;

            // Load PDF to get page count and sizes
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const pdfPages = pdfDoc.getPages();

            // Generate thumbnails using PDF.js via CDN
            const pageInfos: PageInfo[] = pdfPages.map((page, i) => {
                const { width, height } = page.getSize();
                return {
                    index: i,
                    thumbnail: null,
                    width,
                    height,
                    selected: false,
                };
            });

            setPages(pageInfos);

            // Load PDF.js for thumbnails
            try {
                const pdfjsScript = document.createElement('script');
                pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                document.head.appendChild(pdfjsScript);

                await new Promise<void>((resolve) => {
                    pdfjsScript.onload = () => resolve();
                    pdfjsScript.onerror = () => resolve();
                });

                const pdfjsLib = (window as any).pdfjsLib;
                if (pdfjsLib) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                    for (let i = 0; i < pdf.numPages; i++) {
                        const page = await pdf.getPage(i + 1);
                        const viewport = page.getViewport({ scale: 0.3 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext('2d')!;

                        await page.render({
                            canvasContext: ctx,
                            viewport,
                        }).promise;

                        const thumbnail = canvas.toDataURL('image/jpeg', 0.5);
                        setPages((prev) => prev.map((p, idx) =>
                            idx === i ? { ...p, thumbnail } : p
                        ));
                    }
                }
            } catch (e) {
                console.warn('Could not generate thumbnails:', e);
            }
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Failed to load PDF.');
        }

        setLoading(false);
    }, []);

    const handleDrop2 = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    }, [handleFile]);

    const handlePageDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handlePageDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        setPages((prev) => {
            const arr = [...prev];
            const [dragged] = arr.splice(draggedIndex, 1);
            arr.splice(index, 0, dragged);
            return arr;
        });
        setDraggedIndex(index);
    };

    const handlePageDragEnd = () => {
        setDraggedIndex(null);
    };

    const deletePage = (index: number) => {
        setPages((prev) => prev.filter((_, i) => i !== index));
    };

    const toggleSelect = (index: number) => {
        setPages((prev) => prev.map((p, i) =>
            i === index ? { ...p, selected: !p.selected } : p
        ));
    };

    const deleteSelected = () => {
        setPages((prev) => prev.filter((p) => !p.selected));
    };

    const selectedCount = pages.filter((p) => p.selected).length;

    const savePDF = async () => {
        if (!pdfBytesRef.current || pages.length === 0) return;
        setProcessing(true);

        try {
            const srcDoc = await PDFDocument.load(pdfBytesRef.current, { ignoreEncryption: true });
            const newDoc = await PDFDocument.create();

            for (const pageInfo of pages) {
                const [copiedPage] = await newDoc.copyPages(srcDoc, [pageInfo.index]);
                newDoc.addPage(copiedPage);
            }

            const pdfBytes = await newDoc.save();
            const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `organized-${file?.name || 'document.pdf'}`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving PDF:', error);
            alert('Failed to save reorganized PDF.');
        }

        setProcessing(false);
    };

    return (
        <div className="space-y-6">
            {/* Upload */}
            {!file && (
                <Card
                    className={`p-10 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-purple-500 bg-purple-50' : 'border-slate-300 hover:border-purple-400 bg-white'
                        }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop2}
                    onClick={() => document.getElementById('pdf-organize-input')?.click()}
                >
                    <input
                        id="pdf-organize-input"
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    <LayoutGrid className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-slate-800 mb-1">Drop your PDF here</p>
                    <p className="text-sm text-slate-500">or click to browse</p>
                </Card>
            )}

            {/* Loading */}
            {loading && (
                <Card className="p-8 text-center bg-white border border-slate-200">
                    <Loader2 className="h-10 w-10 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Generating page thumbnails...</p>
                </Card>
            )}

            {/* Page Grid */}
            {pages.length > 0 && !loading && (
                <Card className="p-5 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-800">
                            {pages.length} pages — drag to reorder
                        </h3>
                        <div className="flex gap-2">
                            {selectedCount > 0 && (
                                <Button variant="danger" size="sm" onClick={deleteSelected}>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete {selectedCount} selected
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setFile(null);
                                    setPages([]);
                                    pdfBytesRef.current = null;
                                }}
                            >
                                Upload New
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto">
                        {pages.map((page, i) => (
                            <div
                                key={`${page.index}-${i}`}
                                draggable
                                onDragStart={() => handlePageDragStart(i)}
                                onDragOver={(e) => handlePageDragOver(e, i)}
                                onDragEnd={handlePageDragEnd}
                                onClick={() => toggleSelect(i)}
                                className={`relative group cursor-grab active:cursor-grabbing rounded-lg border-2 transition-all ${page.selected
                                        ? 'border-purple-500 ring-2 ring-purple-200'
                                        : draggedIndex === i
                                            ? 'border-purple-400 opacity-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="aspect-[3/4] bg-slate-100 rounded-t-md overflow-hidden">
                                    {page.thumbnail ? (
                                        <img
                                            src={page.thumbnail}
                                            alt={`Page ${i + 1}`}
                                            className="w-full h-full object-contain"
                                            draggable={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <span className="text-xs">Page {page.index + 1}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Page number */}
                                <div className="text-center py-1.5 text-xs font-medium text-slate-600 bg-slate-50 rounded-b-md">
                                    {i + 1}
                                </div>

                                {/* Drag handle */}
                                <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="h-4 w-4 text-slate-400" />
                                </div>

                                {/* Delete button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePage(i);
                                    }}
                                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>

                                {/* Selection indicator */}
                                {page.selected && (
                                    <div className="absolute inset-0 bg-purple-500/10 rounded-lg pointer-events-none" />
                                )}
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={savePDF}
                        disabled={processing || pages.length === 0}
                        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4 mr-2" />
                                Save Organized PDF
                            </>
                        )}
                    </Button>
                </Card>
            )}

            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Organize PDF Pages</h4>
                        <p className="text-sm text-blue-700">
                            Reorder, delete, and organize pages in your PDF visually. Drag and drop
                            page thumbnails to rearrange them. All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

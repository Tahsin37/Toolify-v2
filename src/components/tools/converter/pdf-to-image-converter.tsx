'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    FileText, Upload, ChevronLeft, ChevronRight, Download, Image as ImageIcon,
    Loader2, Settings, FileArchive
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// We load pdf.js from CDN to avoid Next.js webpack bundling issues
const PDFJS_CDN_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_CDN_VERSION}`;

function loadPdfJs(): Promise<any> {
    return new Promise((resolve, reject) => {
        if ((window as any).pdfjsLib) {
            resolve((window as any).pdfjsLib);
            return;
        }

        const script = document.createElement('script');
        script.src = `${PDFJS_CDN}/pdf.min.js`;
        script.onload = () => {
            const lib = (window as any).pdfjsLib;
            if (lib) {
                lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
                resolve(lib);
            } else {
                reject(new Error('pdf.js failed to load'));
            }
        };
        script.onerror = () => reject(new Error('Failed to load pdf.js from CDN'));
        document.head.appendChild(script);
    });
}

export function PdfToImageConverter() {
    const [pdfjsLib, setPdfjsLib] = React.useState<any>(null);
    const [pdfDoc, setPdfDoc] = React.useState<any>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(0);
    const [fileName, setFileName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [rendering, setRendering] = React.useState(false);
    const [converting, setConverting] = React.useState(false);
    const [error, setError] = React.useState('');
    const [libLoading, setLibLoading] = React.useState(true);
    const [format, setFormat] = React.useState<'png' | 'jpeg'>('png');
    const [quality, setQuality] = React.useState(1.0); // 0.1 to 1.0 for jpeg
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Load pdf.js library on mount
    React.useEffect(() => {
        loadPdfJs()
            .then((lib) => {
                setPdfjsLib(lib);
                setLibLoading(false);
            })
            .catch((err) => {
                setError('Failed to load PDF library. Please refresh the page.');
                setLibLoading(false);
                console.error(err);
            });
    }, []);

    const renderPage = React.useCallback(async (pageNum: number) => {
        if (!pdfDoc || !canvasRef.current) return;

        setRendering(true);
        try {
            const page = await pdfDoc.getPage(pageNum);
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            const viewport = page.getViewport({ scale: 2.0 }); // High quality for export

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        } catch (err) {
            console.error('Error rendering page:', err);
            setError('Failed to render page');
        }
        setRendering(false);
    }, [pdfDoc]);

    React.useEffect(() => {
        if (pdfDoc && currentPage) {
            renderPage(currentPage);
        }
    }, [pdfDoc, currentPage, renderPage]);


    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    const processFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            setError('Please upload a PDF file');
            return;
        }

        if (!pdfjsLib) {
            setError('PDF library not loaded yet. Please wait...');
            return;
        }

        setLoading(true);
        setError('');
        setFileName(file.name.replace('.pdf', ''));

        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
            const pdf = await loadingTask.promise;

            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
        } catch (err) {
            console.error('Error loading PDF:', err);
            setError(err instanceof Error ? err.message : 'Failed to load PDF');
            setPdfDoc(null);
        }

        setLoading(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const downloadCurrentPage = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const imageType = format === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(imageType, quality);

        const link = document.createElement('a');
        link.download = `${fileName}-page-${currentPage}.${format}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAllPages = async () => {
        if (!pdfDoc) return;
        setConverting(true);
        const zip = new JSZip();
        const folder = zip.folder(fileName) || zip;

        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) throw new Error('Canvas context not available');

            for (let i = 1; i <= totalPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

                const imageType = format === 'png' ? 'image/png' : 'image/jpeg';
                // Remove prefix to get base64 data
                const dataUrl = canvas.toDataURL(imageType, quality);
                const base64Data = dataUrl.split(',')[1];

                folder.file(`page-${i}.${format}`, base64Data, { base64: true });
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${fileName}-images.zip`);

        } catch (err) {
            console.error('Error converting all pages:', err);
            setError('Failed to convert all pages');
        }
        setConverting(false);
    };

    if (libLoading) {
        return (
            <div className="space-y-6">
                <Card className="p-8 text-center">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-3" />
                    <p className="text-slate-600">Loading PDF library...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {!pdfDoc && (
                <Card
                    className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-indigo-50/30 hover:border-indigo-400 transition-all cursor-pointer text-center"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
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
                            Upload PDF File
                        </h3>
                        <p className="text-sm text-slate-500">Drop file here or click to browse</p>
                    </div>
                </Card>
            )}

            {error && (
                <Card className="p-4 bg-rose-50 border border-rose-200">
                    <p className="text-rose-700 text-sm">{error}</p>
                </Card>
            )}

            {pdfDoc && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Controls */}
                    <Card className="p-6 bg-white border border-slate-200 h-fit lg:sticky lg:top-6 space-y-6">
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                                <Settings className="h-4 w-4 mr-2" /> Conversion Settings
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Format</label>
                                    <div className="flex rounded-lg border border-slate-200 p-1 bg-slate-50">
                                        <button
                                            onClick={() => setFormat('png')}
                                            className={cn(
                                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                                                format === 'png' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            PNG (Lossless)
                                        </button>
                                        <button
                                            onClick={() => setFormat('jpeg')}
                                            className={cn(
                                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-colors",
                                                format === 'jpeg' ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            JPEG (Compressed)
                                        </button>
                                    </div>
                                </div>

                                {format === 'jpeg' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Quality: {Math.round(quality * 100)}%
                                        </label>
                                        <input
                                            type="range"
                                            min="0.1"
                                            max="1.0"
                                            step="0.1"
                                            value={quality}
                                            onChange={(e) => setQuality(parseFloat(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                            <Button
                                variant="primary"
                                onClick={downloadCurrentPage}
                                className="w-full"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Page {currentPage}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={downloadAllPages}
                                disabled={converting}
                                className="w-full"
                            >
                                {converting ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <FileArchive className="h-4 w-4 mr-2" />
                                )}
                                {converting ? 'Converting...' : 'Download All (ZIP)'}
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setPdfDoc(null);
                                    setFileName('');
                                }}
                                className="w-full text-slate-500"
                            >
                                Upload New File
                            </Button>
                        </div>
                    </Card>

                    {/* Preview */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="p-4 bg-white border border-slate-200">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900">{fileName}</h3>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage <= 1 || rendering}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-medium w-20 text-center">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage >= totalPages || rendering}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-8 bg-slate-50 border border-slate-200 min-h-[600px] flex items-center justify-center">
                            {rendering && (
                                <div className="absolute flex items-center gap-2 text-slate-500 bg-white/80 p-2 rounded-lg backdrop-blur-sm z-10">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Rendering preview...</span>
                                </div>
                            )}
                            <canvas
                                ref={canvasRef}
                                className={cn(
                                    "max-w-full shadow-lg bg-white transition-opacity duration-200",
                                    rendering ? "opacity-50" : "opacity-100"
                                )}
                            />
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}

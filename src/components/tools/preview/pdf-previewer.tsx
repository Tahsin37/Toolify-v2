'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    FileText, Upload, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Info, Loader2, RotateCw
} from 'lucide-react';

// We load pdf.js from CDN to avoid Next.js webpack bundling issues
// (Object.defineProperty called on non-object error)
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

export function PdfPreviewer() {
    const [pdfjsLib, setPdfjsLib] = React.useState<any>(null);
    const [pdfDoc, setPdfDoc] = React.useState<any>(null);
    const [currentPage, setCurrentPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(0);
    const [scale, setScale] = React.useState(1.5);
    const [rotation, setRotation] = React.useState(0);
    const [fileName, setFileName] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [rendering, setRendering] = React.useState(false);
    const [error, setError] = React.useState('');
    const [libLoading, setLibLoading] = React.useState(true);
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

            const viewport = page.getViewport({ scale, rotation });

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
    }, [pdfDoc, scale, rotation]);

    React.useEffect(() => {
        if (pdfDoc && currentPage) {
            renderPage(currentPage);
        }
    }, [pdfDoc, currentPage, scale, rotation, renderPage]);


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
        setFileName(file.name);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);

            const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
            const pdf = await loadingTask.promise;

            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);
            setCurrentPage(1);
            setScale(1.5);
            setRotation(0);
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

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
    const rotate = () => setRotation(prev => (prev + 90) % 360);

    const clearData = () => {
        setPdfDoc(null);
        setCurrentPage(1);
        setTotalPages(0);
        setScale(1.5);
        setRotation(0);
        setFileName('');
        setError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (libLoading) {
        return (
            <div className="space-y-6">
                <Card className="p-8 text-center">
                    <Loader2 className="h-8 w-8 text-red-600 animate-spin mx-auto mb-3" />
                    <p className="text-slate-600">Loading PDF library...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            {!pdfDoc && (
                <Card
                    className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-red-50/30 hover:border-red-400 transition-all cursor-pointer text-center"
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
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                            {loading ? (
                                <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
                            ) : (
                                <FileText className="h-8 w-8 text-red-600" />
                            )}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            Upload PDF File
                        </h3>
                        <p className="text-sm text-slate-500">Drop file here or click to browse</p>
                        <p className="text-xs text-slate-400 mt-2">Supports .pdf files</p>
                    </div>
                </Card>
            )}

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-red-700 text-sm">{error}</p>
                </Card>
            )}

            {/* PDF Preview */}
            {pdfDoc && (
                <>
                    {/* Toolbar */}
                    <Card className="p-4 bg-white border border-slate-200">
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="font-medium text-slate-800 text-sm">{fileName}</p>
                                    <p className="text-xs text-slate-500">
                                        {totalPages} page{totalPages > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min={1}
                                        max={totalPages}
                                        value={currentPage}
                                        onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                                        className="w-16 h-8 text-center border border-slate-300 rounded text-sm"
                                    />
                                    <span className="text-sm text-slate-500">/ {totalPages}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage >= totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <div className="h-6 w-px bg-slate-200" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={zoomOut}
                                    disabled={scale <= 0.5}
                                >
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-slate-600 w-12 text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={zoomIn}
                                    disabled={scale >= 3}
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={rotate}
                                    title="Rotate 90°"
                                >
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                                <div className="h-6 w-px bg-slate-200" />
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

                    {/* PDF Canvas */}
                    <Card className="p-8 bg-slate-50 border border-slate-200">
                        <div className="flex justify-center items-center min-h-[600px]">
                            {rendering && (
                                <div className="absolute flex items-center gap-2 text-slate-500">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="text-sm">Rendering page...</span>
                                </div>
                            )}
                            <canvas
                                ref={canvasRef}
                                className="max-w-full shadow-lg bg-white"
                                style={{ opacity: rendering ? 0.5 : 1 }}
                            />
                        </div>
                    </Card>
                </>
            )}

            {/* Info */}
            <Card className="p-4 bg-red-50 border border-red-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-red-800 mb-1">PDF Previewer</h4>
                        <p className="text-sm text-red-700">
                            Preview PDF files with page navigation, zoom controls, and rotation.
                            All processing happens locally in your browser for maximum privacy.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

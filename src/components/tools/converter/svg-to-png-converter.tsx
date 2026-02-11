'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, Download, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

export function SvgToPngConverter() {
    const [svgContent, setSvgContent] = React.useState<string>('');
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
    const [pngUrl, setPngUrl] = React.useState<string | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });
    const [isConverting, setIsConverting] = React.useState(false);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'image/svg+xml') {
            setError('Please upload a valid SVG file.');
            return;
        }

        try {
            const text = await file.text();
            setSvgContent(text);
            setPreviewUrl(URL.createObjectURL(file));
            setError(null);
            setPngUrl(null);
        } catch (err) {
            setError('Failed to read SVG file.');
        }
    };

    const handleConvert = () => {
        if (!svgContent || !canvasRef.current) return;

        setIsConverting(true);
        setError(null);

        const img = new Image();
        const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                setError('Canvas context not available.');
                setIsConverting(false);
                return;
            }

            // Set canvas dimensions to image dimensions or default
            canvas.width = img.width || dimensions.width;
            canvas.height = img.height || dimensions.height;

            // Update state to reflect actual dimensions
            setDimensions({ width: canvas.width, height: canvas.height });

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            try {
                const pngValues = canvas.toDataURL('image/png');
                setPngUrl(pngValues);
                setIsConverting(false);
                URL.revokeObjectURL(url);
            } catch (err) {
                setError('Failed to convert to PNG. Browser security settings might be blocking canvas export.');
                setIsConverting(false);
            }
        };

        img.onerror = () => {
            setError('Failed to load SVG for conversion. The SVG might be malformed.');
            setIsConverting(false);
            URL.revokeObjectURL(url);
        };

        img.src = url;
    };

    const handleDownload = () => {
        if (!pngUrl) return;
        const link = document.createElement('a');
        link.download = 'converted-image.png';
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="mb-4 p-4 bg-indigo-100 rounded-full">
                        <Upload className="h-8 w-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Upload SVG File</h3>
                    <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
                        Select an SVG file to convert to high-quality PNG format.
                    </p>
                    <label className="cursor-pointer inline-block">
                        <div className="inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 active:scale-[0.98] bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 ring-indigo-500 h-11 px-6 text-sm rounded-xl">
                            <span>Choose SVG</span>
                        </div>
                        <input
                            type="file"
                            accept=".svg,image/svg+xml"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </Card>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center text-rose-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                </div>
            )}

            {svgContent && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Preview */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm flex flex-col items-center">
                        <h4 className="font-medium text-slate-700 mb-4 w-full border-b pb-2">SVG Preview</h4>
                        <div className="flex-1 w-full flex items-center justify-center bg-slate-100 rounded-lg p-4 min-h-[300px]">
                            {previewUrl && (
                                <img src={previewUrl} alt="SVG Preview" className="max-w-full max-h-[300px]" />
                            )}
                        </div>
                        <div className="mt-4 w-full">
                            <Button
                                onClick={handleConvert}
                                disabled={isConverting}
                                className="w-full"
                                variant="primary" // Explicitly using 'primary' to avoid build error
                            >
                                {isConverting ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Converting...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2" /> Convert to PNG
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>

                    {/* Result */}
                    <Card className="p-4 bg-white border border-slate-200 shadow-sm flex flex-col items-center">
                        <h4 className="font-medium text-slate-700 mb-4 w-full border-b pb-2">PNG Output</h4>
                        <div className="flex-1 w-full flex items-center justify-center bg-slate-100 rounded-lg p-4 min-h-[300px] relative">
                            {pngUrl ? (
                                <img src={pngUrl} alt="PNG Result" className="max-w-full max-h-[300px] shadow-sm bg-white" />
                            ) : (
                                <div className="text-slate-400 text-sm flex flex-col items-center">
                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                    No conversion yet
                                </div>
                            )}
                        </div>
                        <div className="mt-4 w-full">
                            <Button
                                onClick={handleDownload}
                                disabled={!pngUrl}
                                variant="outline"
                                className="w-full"
                            >
                                <Download className="h-4 w-4 mr-2" /> Download PNG
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}

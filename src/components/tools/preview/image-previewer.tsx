'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, ZoomIn, ZoomOut, RotateCw, Image as ImageIcon, Info, Move } from 'lucide-react';

export function ImagePreviewer() {
    const [imageUrl, setImageUrl] = React.useState<string | null>(null);
    const [fileInfo, setFileInfo] = React.useState<{ name: string; size: string; type: string; dimensions?: string } | null>(null);
    const [scale, setScale] = React.useState(1);
    const [rotation, setRotation] = React.useState(0);
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = React.useState(false);
    const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
    const imageRef = React.useRef<HTMLImageElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setImageUrl(url);
        setFileInfo({
            name: file.name,
            size: (file.size / 1024).toFixed(2) + ' KB',
            type: file.type,
        });
        resetView();

        // Get dimensions
        const img = new Image();
        img.onload = () => {
            setFileInfo(prev => prev ? { ...prev, dimensions: `${img.width} x ${img.height} px` } : null);
        };
        img.src = url;
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setImageUrl(url);
            setFileInfo({
                name: file.name,
                size: (file.size / 1024).toFixed(2) + ' KB',
                type: file.type,
            });
            resetView();

            const img = new Image();
            img.onload = () => {
                setFileInfo(prev => prev ? { ...prev, dimensions: `${img.width} x ${img.height} px` } : null);
            };
            img.src = url;
        }
    };

    const resetView = () => {
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
    };

    const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 5));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));
    const rotate = () => setRotation(prev => (prev + 90) % 360);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return (
        <div className="space-y-6">
            {!imageUrl && (
                <Card
                    className="p-8 border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer text-center"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    <label className="cursor-pointer block">
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
                                <ImageIcon className="h-8 w-8 text-slate-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                Upload Image
                            </h3>
                            <p className="text-sm text-slate-500">Drop PNG, JPG, WebP, SVG here</p>
                        </div>
                    </label>
                </Card>
            )}

            {imageUrl && (
                <div className="space-y-4">
                    {/* Toolbar */}
                    <Card className="p-4 bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                            {fileInfo && (
                                <>
                                    <span className="font-medium text-slate-900">{fileInfo.name}</span>
                                    <span className="hidden md:inline text-slate-300">|</span>
                                    <span className="hidden md:inline">{fileInfo.dimensions}</span>
                                    <span className="hidden md:inline text-slate-300">|</span>
                                    <span className="hidden md:inline">{fileInfo.size}</span>
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.1}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <span className="w-16 text-center text-sm font-medium">{Math.round(scale * 100)}%</span>
                            <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 5}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <div className="h-6 w-px bg-slate-200 mx-1" />
                            <Button variant="outline" size="sm" onClick={rotate}>
                                <RotateCw className="h-4 w-4 mr-2" /> Rotate
                            </Button>
                            <div className="h-6 w-px bg-slate-200 mx-1" />
                            <Button variant="ghost" size="sm" onClick={() => setImageUrl(null)}>
                                <Upload className="h-4 w-4 mr-2" /> New
                            </Button>
                        </div>
                    </Card>

                    {/* Preview Area */}
                    <Card className="p-0 border border-slate-200 bg-slate-100 overflow-hidden relative h-[600px] flex items-center justify-center">
                        <div
                            className={cn(
                                "flex items-center justify-center w-full h-full p-8 transition-transform duration-200 ease-out",
                                isDragging ? "cursor-grabbing" : "cursor-grab"
                            )}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Preview"
                                className="max-w-none shadow-lg transition-transform duration-200"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale})`,
                                    maxWidth: scale <= 1 ? '100%' : 'none',
                                    maxHeight: scale <= 1 ? '100%' : 'none',
                                }}
                                draggable={false}
                            />
                        </div>

                        {/* Controls Overlay Hint */}
                        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 shadow-sm border border-slate-200 flex items-center pointer-events-none">
                            <Move className="h-3 w-3 mr-1.5" />
                            Drag to pan • Scroll to zoom
                        </div>
                    </Card>
                </div>
            )}

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Image Previewer</h4>
                        <p className="text-sm text-indigo-700">
                            Inspect images in detail. Supports zooming, panning, and rotation without any server uploads.
                            Compatible with PNG, JPG, GIF, WebP, and SVG formats.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

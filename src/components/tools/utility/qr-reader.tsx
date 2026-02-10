'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    QrCode, Upload, Camera, Copy, CheckCircle2,
    Info, Loader2, Link2, Mail, Phone, Wifi
} from 'lucide-react';

interface QRResult {
    text: string;
    type: 'url' | 'email' | 'phone' | 'wifi' | 'text';
}

export function QrReader() {
    const [result, setResult] = React.useState<QRResult | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    const detectQRType = (text: string): QRResult['type'] => {
        if (text.startsWith('http://') || text.startsWith('https://')) return 'url';
        if (text.startsWith('mailto:')) return 'email';
        if (text.startsWith('tel:')) return 'phone';
        if (text.startsWith('WIFI:')) return 'wifi';
        return 'text';
    };

    const decodeQR = async (imageData: ImageData): Promise<string | null> => {
        // Using jsQR library for decoding
        const jsQR = (await import('jsqr')).default;
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        return code?.data || null;
    };

    const processImage = async (file: File) => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Create image preview
            const url = URL.createObjectURL(file);
            setPreview(url);

            // Load image
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = url;
            });

            // Draw to canvas
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;

            // Size canvas to image
            const maxSize = 1000;
            let width = img.width;
            let height = img.height;

            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width *= ratio;
                height *= ratio;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Get image data and decode
            const imageData = ctx.getImageData(0, 0, width, height);
            const text = await decodeQR(imageData);

            if (text) {
                setResult({
                    text,
                    type: detectQRType(text)
                });
            } else {
                setError('No QR code found in image. Try a clearer image.');
            }
        } catch (err) {
            console.error('QR decode error:', err);
            setError(err instanceof Error ? err.message : 'Failed to decode QR code');
        }

        setLoading(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processImage(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    };

    const copyResult = async () => {
        if (!result) return;
        await navigator.clipboard.writeText(result.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openResult = () => {
        if (!result) return;
        if (result.type === 'url') {
            window.open(result.text, '_blank');
        } else if (result.type === 'email') {
            window.location.href = result.text;
        } else if (result.type === 'phone') {
            window.location.href = result.text;
        }
    };

    const TypeIcon = ({ type }: { type: QRResult['type'] }) => {
        switch (type) {
            case 'url': return <Link2 className="h-5 w-5" />;
            case 'email': return <Mail className="h-5 w-5" />;
            case 'phone': return <Phone className="h-5 w-5" />;
            case 'wifi': return <Wifi className="h-5 w-5" />;
            default: return <QrCode className="h-5 w-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-purple-50/30 hover:border-purple-400 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                        {loading ? (
                            <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
                        ) : (
                            <QrCode className="h-8 w-8 text-purple-600" />
                        )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        {loading ? 'Scanning...' : 'Upload QR Code Image'}
                    </h3>
                    <p className="text-sm text-slate-500">Drop an image or click to browse</p>
                    <p className="text-xs text-slate-400 mt-2">Supports JPG, PNG, GIF, WebP</p>
                </div>
            </Card>

            {/* Hidden canvas for processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Preview */}
            {preview && (
                <Card className="p-4 bg-white border border-slate-200">
                    <p className="text-sm font-medium text-slate-700 mb-2">Uploaded Image:</p>
                    <img
                        src={preview}
                        alt="QR Code"
                        className="max-h-64 rounded-lg border border-slate-200 mx-auto"
                    />
                </Card>
            )}

            {/* Result */}
            {result && (
                <Card className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <TypeIcon type={result.type} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-emerald-800">QR Code Detected!</h3>
                                <p className="text-sm text-emerald-600 capitalize">{result.type}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={copyResult}>
                            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-emerald-200 mb-4">
                        <p className="font-mono text-sm text-slate-800 break-all">{result.text}</p>
                    </div>

                    {(result.type === 'url' || result.type === 'email' || result.type === 'phone') && (
                        <Button onClick={openResult} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {result.type === 'url' ? 'Open URL' : result.type === 'email' ? 'Send Email' : 'Call Number'}
                        </Button>
                    )}

                    {result.type === 'wifi' && (
                        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                            <p className="font-medium mb-1">WiFi Network Detected</p>
                            <p>Copy the details above to connect manually.</p>
                        </div>
                    )}
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-red-700">{error}</p>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-purple-50 border border-purple-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-purple-800 mb-1">QR Code Reader</h4>
                        <p className="text-sm text-purple-700">
                            Scan QR codes from images. Supports URLs, emails, phone numbers, WiFi credentials,
                            and plain text. All processing happens locally in your browser.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

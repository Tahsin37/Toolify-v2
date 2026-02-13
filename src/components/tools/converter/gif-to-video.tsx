'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Upload, Download, FileImage, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

export function GifToVideo() {
    const [loaded, setLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [error, setError] = useState<string | null>(null);
    const ffmpegRef = useRef<FFmpeg>(new FFmpeg());

    const load = async () => {
        setIsLoading(true);
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        const ffmpeg = ffmpegRef.current;

        ffmpeg.on('progress', ({ progress }) => {
            setProgress(Math.round(progress * 100));
        });

        try {
            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            });
            setLoaded(true);
        } catch (err: any) {
            console.error('Failed to load ffmpeg:', err);
            setError('Failed to load video processor. Your browser might not support the required features (SharedArrayBuffer) or network access is blocked.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setVideoUrl(null);
            setProgress(0);
            setStatus('');
            setError(null);
        }
    };

    const convertToVideo = async () => {
        if (!file || !loaded) return;

        setIsLoading(true);
        setProgress(0);
        setError(null);
        setStatus('Transcoding...');

        const ffmpeg = ffmpegRef.current;
        const inputName = 'input.gif';
        const outputName = 'output.mp4';

        try {
            await ffmpeg.writeFile(inputName, await fetchFile(file));

            // Run conversion: -i input.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4
            // yuv420p is needed for compatibility with most players
            // scale is needed because h264 requires even dimensions
            // Improved quality settings:
            // -movflags faststart: Enable playback before download completes
            // -pix_fmt yuv420p: Maximum compatibility
            // -c:v libx264: H.264 codec
            // -crf 23: Good quality/size balance (lower is better, 18-28 is standard)
            // -preset fast: Balance speed/compression
            // -vf: Ensure even dimensions (required for H.264)
            await ffmpeg.exec([
                '-i', inputName,
                '-movflags', 'faststart',
                '-pix_fmt', 'yuv420p',
                '-c:v', 'libx264',
                '-crf', '23',
                '-preset', 'fast',
                '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
                outputName
            ]);

            const data = await ffmpeg.readFile(outputName);
            const blob = new Blob([data as any], { type: 'video/mp4' });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setStatus('Conversion complete!');
        } catch (err) {
            console.error(err);
            setError('Error converting GIF to Video.');
        } finally {
            setIsLoading(false);
        }
    };

    const downloadVideo = () => {
        if (videoUrl) {
            const a = document.createElement('a');
            a.href = videoUrl;
            a.download = file ? `${file.name.split('.')[0]}.mp4` : 'converted.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    GIF to Video Converter
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                    Convert animated GIFs to optimized MP4 videos for sharing on social media (Instagram, WhatsApp, etc).
                </p>
            </div>

            <Card className="p-8 border-slate-200">
                {!loaded && !error ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
                        <p className="text-slate-500">Loading video processor engine...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl text-red-600 border border-red-100">
                        <AlertCircle className="h-10 w-10 mb-2" />
                        <p className="font-medium text-center">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* File Upload Area */}
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${file ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'
                                }`}
                        >
                            <input
                                type="file"
                                accept="image/gif"
                                onChange={handleFile}
                                className="hidden"
                                id="gif-upload"
                            />
                            <label
                                htmlFor="gif-upload"
                                className="cursor-pointer flex flex-col items-center justify-center"
                            >
                                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mb-4">
                                    {file ? <FileImage className="h-8 w-8 text-indigo-600" /> : <Upload className="h-8 w-8 text-slate-400" />}
                                </div>
                                {file ? (
                                    <>
                                        <p className="font-medium text-slate-900">{file.name}</p>
                                        <p className="text-sm text-slate-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        <p className="text-xs text-indigo-600 mt-2 font-medium">Click to change file</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-medium text-slate-900">Click to upload or drag and drop</p>
                                        <p className="text-sm text-slate-500 mt-1">GIF Files (Max 20MB recommended)</p>
                                    </>
                                )}
                            </label>
                        </div>

                        {/* Actions */}
                        {file && (
                            <div className="flex flex-col items-center space-y-4">
                                {!videoUrl ? (
                                    <Button
                                        size="lg"
                                        onClick={convertToVideo}
                                        disabled={isLoading}
                                        className="w-full sm:w-auto min-w-[200px] h-12 text-base rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                Processing {progress}%
                                            </>
                                        ) : (
                                            <>
                                                <RefreshCw className="mr-2 h-5 w-5" />
                                                Convert to MP4
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <div className="flex gap-4">
                                        <Button
                                            size="lg"
                                            onClick={downloadVideo}
                                            className="min-w-[200px] h-12 text-base rounded-full bg-green-600 hover:bg-green-700 shadow-xl shadow-green-600/20"
                                        >
                                            <Download className="mr-2 h-5 w-5" />
                                            Download MP4
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => { setFile(null); setVideoUrl(null); }}
                                            className="h-12 px-6 rounded-full"
                                        >
                                            Convert Another
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Result Preview */}
                        {videoUrl && (
                            <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-200">
                                <p className="text-center text-sm font-medium text-slate-500 mb-4">Preview</p>
                                <video src={videoUrl} controls controlsList="nodownload" className="max-w-full h-auto mx-auto rounded-lg shadow-sm" />
                            </div>
                        )}

                        {/* Status Message */}
                        {status && <p className="text-center text-sm text-slate-500">{status}</p>}
                    </div>
                )}
            </Card>
        </div>
    );
}

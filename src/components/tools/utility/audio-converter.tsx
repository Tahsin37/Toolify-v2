'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Music, ArrowRight, Info, Play, Volume2, FileAudio, CheckCircle2, AlertTriangle } from 'lucide-react';

type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'webm';

export function AudioConverter() {
    const [mediaFile, setMediaFile] = React.useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = React.useState<string>('');
    const [targetFormat, setTargetFormat] = React.useState<AudioFormat>('wav');
    const [converting, setConverting] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [convertedUrl, setConvertedUrl] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');
    const [isVideo, setIsVideo] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        // Accept both audio and video files
        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
            setMediaFile(file);
            setMediaUrl(URL.createObjectURL(file));
            setConvertedUrl('');
            setError('');
            setIsVideo(file.type.startsWith('video/'));
        } else {
            setError('Please upload an audio or video file (MP3, MP4, WAV, OGG, WebM, etc.)');
        }
    };

    const convertAudio = async () => {
        if (!mediaFile) return;
        setConverting(true);
        setProgress(0);
        setError('');

        try {
            // Create audio context
            const audioContext = new AudioContext();
            setProgress(10);

            // For video files, we need to extract audio using a different method
            let audioBuffer: AudioBuffer;

            if (isVideo && videoRef.current) {
                // Create a media element source for video
                const video = videoRef.current;
                video.currentTime = 0;

                // Get audio from video using fetch and decode
                const response = await fetch(mediaUrl);
                const arrayBuffer = await response.arrayBuffer();
                setProgress(30);

                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            } else {
                // Regular audio file
                const arrayBuffer = await mediaFile.arrayBuffer();
                setProgress(30);
                audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            }

            setProgress(50);

            // Create offline context for rendering
            const offlineContext = new OfflineAudioContext(
                audioBuffer.numberOfChannels,
                audioBuffer.length,
                audioBuffer.sampleRate
            );

            const source = offlineContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineContext.destination);
            source.start(0);

            const renderedBuffer = await offlineContext.startRendering();
            setProgress(70);

            // Convert to WAV format
            const wavBlob = audioBufferToWav(renderedBuffer);
            setProgress(85);

            // For other formats, use MediaRecorder if possible
            let outputBlob: Blob;
            const mimeType = getMimeType(targetFormat);

            if (targetFormat === 'wav') {
                outputBlob = wavBlob;
            } else if (MediaRecorder.isTypeSupported(mimeType)) {
                outputBlob = await convertWithMediaRecorder(audioBuffer, mimeType);
            } else {
                // Fallback to WAV if format not supported
                outputBlob = wavBlob;
                setError(`${targetFormat.toUpperCase()} not supported in your browser. Generated WAV instead.`);
            }

            const url = URL.createObjectURL(outputBlob);
            setConvertedUrl(url);
            setProgress(100);

            await audioContext.close();
        } catch (err) {
            console.error('Error converting audio:', err);
            setError('Conversion failed. The file format may not be supported by your browser.');
        }

        setConverting(false);
    };

    const audioBufferToWav = (buffer: AudioBuffer): Blob => {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        const dataSize = buffer.length * blockAlign;
        const headerSize = 44;
        const totalSize = headerSize + dataSize;

        const arrayBuffer = new ArrayBuffer(totalSize);
        const view = new DataView(arrayBuffer);

        // RIFF header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, totalSize - 8, true);
        writeString(view, 8, 'WAVE');

        // fmt chunk
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);

        // data chunk
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

        // Interleave channels
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    const convertWithMediaRecorder = async (buffer: AudioBuffer, mimeType: string): Promise<Blob> => {
        return new Promise((resolve) => {
            const audioContext = new AudioContext();
            const source = audioContext.createBufferSource();
            source.buffer = buffer;

            const dest = audioContext.createMediaStreamDestination();
            source.connect(dest);

            const recorder = new MediaRecorder(dest.stream, { mimeType });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                resolve(new Blob(chunks, { type: mimeType }));
                audioContext.close();
            };

            recorder.start();
            source.start(0);
            source.onended = () => recorder.stop();
        });
    };

    const getMimeType = (format: AudioFormat): string => {
        const mimeTypes: Record<AudioFormat, string> = {
            mp3: 'audio/mpeg',
            wav: 'audio/wav',
            ogg: 'audio/ogg',
            webm: 'audio/webm',
        };
        return mimeTypes[format];
    };

    const downloadAudio = () => {
        if (!convertedUrl || !mediaFile) return;
        const a = document.createElement('a');
        a.href = convertedUrl;
        const baseName = mediaFile.name.split('.').slice(0, -1).join('.');
        a.download = `${baseName || 'converted'}.${targetFormat}`;
        a.click();
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-indigo-400 hover:from-indigo-50/50 hover:to-violet-50/50 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-indigo-100 rounded-2xl mb-4 group-hover:bg-indigo-200 transition-colors">
                        {isVideo ? (
                            <Play className="h-10 w-10 text-indigo-600" />
                        ) : (
                            <Music className="h-10 w-10 text-indigo-600" />
                        )}
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-1">
                        {mediaFile ? mediaFile.name : 'Drop audio or video file here'}
                    </p>
                    <p className="text-sm text-slate-500 mb-2">
                        {mediaFile ? formatSize(mediaFile.size) : 'Supports MP3, MP4, WAV, OGG, WebM, M4A, FLAC'}
                    </p>
                    {isVideo && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                            <Volume2 className="h-3 w-3" />
                            Audio will be extracted from video
                        </span>
                    )}
                </div>
            </Card>

            {/* Media Preview */}
            {mediaUrl && (
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                        <FileAudio className="h-4 w-4 mr-2 text-indigo-500" />
                        Original {isVideo ? 'Video' : 'Audio'}
                    </h3>
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            controls
                            className="w-full rounded-lg max-h-64"
                            src={mediaUrl}
                        />
                    ) : (
                        <audio controls className="w-full" src={mediaUrl} />
                    )}
                </Card>
            )}

            {/* Format Selection */}
            {mediaFile && (
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Output Format</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 p-3 bg-slate-100 rounded-lg text-center">
                            <p className="text-xs text-slate-500 mb-1">Current</p>
                            <p className="font-semibold text-slate-700 uppercase">
                                {mediaFile.name.split('.').pop()}
                            </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="grid grid-cols-2 gap-2">
                                {(['wav', 'webm', 'ogg'] as AudioFormat[]).map((fmt) => (
                                    <button
                                        key={fmt}
                                        onClick={() => setTargetFormat(fmt)}
                                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${targetFormat === fmt
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {fmt.toUpperCase()}
                                        {fmt === 'wav' && <span className="block text-xs opacity-70">Lossless</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Card className="p-4 bg-amber-50 border border-amber-200">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <p className="text-sm text-amber-700">{error}</p>
                    </div>
                </Card>
            )}

            {/* Progress Bar */}
            {converting && (
                <Card className="p-4 bg-indigo-50 border border-indigo-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-indigo-700">
                            {isVideo ? 'Extracting audio...' : 'Converting...'}
                        </span>
                        <span className="text-sm font-bold text-indigo-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-indigo-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>
            )}

            {/* Convert Button */}
            {mediaFile && !converting && (
                <Button
                    onClick={convertAudio}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 h-14 text-lg font-semibold shadow-lg shadow-indigo-500/25"
                >
                    <Volume2 className="h-5 w-5 mr-2" />
                    {isVideo ? 'Extract Audio' : 'Convert Audio'}
                </Button>
            )}

            {/* Converted Audio */}
            {convertedUrl && (
                <Card className="p-5 bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-emerald-700">Conversion Complete!</h3>
                    </div>
                    <audio controls className="w-full mb-4" src={convertedUrl} />
                    <Button
                        onClick={downloadAudio}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download {targetFormat.toUpperCase()}
                    </Button>
                </Card>
            )}

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 bg-blue-50 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                        <Info className="h-4 w-4 mr-2" />
                        Supported Formats
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Input:</strong> MP3, MP4, WAV, OGG, WebM, M4A, FLAC</li>
                        <li>• <strong>Output:</strong> WAV, WebM, OGG</li>
                        <li>• Video files → Audio extraction</li>
                    </ul>
                </Card>
                <Card className="p-4 bg-emerald-50 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-800 mb-2">✅ Privacy First</h4>
                    <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• 100% browser-based processing</li>
                        <li>• No file uploads to server</li>
                        <li>• Your files never leave your device</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}

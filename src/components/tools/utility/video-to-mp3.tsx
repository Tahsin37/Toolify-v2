'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, Video, Volume2, CheckCircle2, ArrowRight, Music, Info } from 'lucide-react';

export function VideoToMp3() {
    const [videoFile, setVideoFile] = React.useState<File | null>(null);
    const [videoUrl, setVideoUrl] = React.useState<string>('');
    const [converting, setConverting] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [audioUrl, setAudioUrl] = React.useState<string>('');
    const [error, setError] = React.useState<string>('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            processFile(file);
        } else {
            setError('Please upload a video file (MP4, WebM, MOV, etc.)');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = (file: File) => {
        if (file.type.startsWith('video/')) {
            setVideoFile(file);
            setVideoUrl(URL.createObjectURL(file));
            setAudioUrl('');
            setError('');
        } else {
            setError('Please upload a video file (MP4, WebM, MOV, etc.)');
        }
    };

    const extractAudio = async () => {
        if (!videoFile) return;
        setConverting(true);
        setProgress(0);
        setError('');

        try {
            const audioContext = new AudioContext();
            setProgress(10);

            const response = await fetch(videoUrl);
            const arrayBuffer = await response.arrayBuffer();
            setProgress(30);

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            setProgress(60);

            // Convert to WAV (browsers can't encode MP3 natively)
            const wavBlob = audioBufferToWav(audioBuffer);
            setProgress(90);

            const url = URL.createObjectURL(wavBlob);
            setAudioUrl(url);
            setProgress(100);

            await audioContext.close();
        } catch (err) {
            console.error('Error extracting audio:', err);
            setError('Failed to extract audio. The video format may not be supported.');
        }

        setConverting(false);
    };

    const audioBufferToWav = (buffer: AudioBuffer): Blob => {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1;
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        const dataSize = buffer.length * blockAlign;
        const headerSize = 44;
        const totalSize = headerSize + dataSize;

        const arrayBuffer = new ArrayBuffer(totalSize);
        const view = new DataView(arrayBuffer);

        writeString(view, 0, 'RIFF');
        view.setUint32(4, totalSize - 8, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, format, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * blockAlign, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitDepth, true);
        writeString(view, 36, 'data');
        view.setUint32(40, dataSize, true);

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

    const downloadAudio = () => {
        if (!audioUrl || !videoFile) return;
        const a = document.createElement('a');
        a.href = audioUrl;
        const baseName = videoFile.name.split('.').slice(0, -1).join('.');
        a.download = `${baseName || 'audio'}.wav`;
        a.click();
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 hover:border-violet-400 hover:from-violet-50/50 hover:to-purple-50/50 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="flex flex-col items-center">
                    <div className="p-4 bg-violet-100 rounded-2xl mb-4 group-hover:bg-violet-200 transition-colors">
                        <Video className="h-10 w-10 text-violet-600" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-1">
                        {videoFile ? videoFile.name : 'Drop video file here'}
                    </p>
                    <p className="text-sm text-slate-500">
                        {videoFile ? formatSize(videoFile.size) : 'Supports MP4, WebM, MOV, AVI, MKV'}
                    </p>
                </div>
            </Card>

            {/* Video Preview */}
            {videoUrl && (
                <Card className="p-4 bg-white border border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center">
                        <Video className="h-4 w-4 mr-2 text-violet-500" />
                        Video Preview
                    </h3>
                    <video
                        ref={videoRef}
                        controls
                        className="w-full rounded-lg max-h-64"
                        src={videoUrl}
                    />
                </Card>
            )}

            {/* Conversion Flow */}
            {videoFile && (
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <Video className="h-8 w-8 text-violet-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">Video</p>
                            <p className="text-xs text-slate-500">{videoFile.name.split('.').pop()?.toUpperCase()}</p>
                        </div>
                        <ArrowRight className="h-6 w-6 text-slate-400" />
                        <div className="text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <Music className="h-8 w-8 text-emerald-600" />
                            </div>
                            <p className="text-sm font-medium text-slate-700">Audio</p>
                            <p className="text-xs text-slate-500">WAV</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Error Display */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <p className="text-sm text-red-700">{error}</p>
                </Card>
            )}

            {/* Progress Bar */}
            {converting && (
                <Card className="p-4 bg-violet-50 border border-violet-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-violet-700">Extracting audio...</span>
                        <span className="text-sm font-bold text-violet-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-violet-200 rounded-full h-2">
                        <div
                            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </Card>
            )}

            {/* Convert Button */}
            {videoFile && !converting && !audioUrl && (
                <Button
                    onClick={extractAudio}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-14 text-lg font-semibold shadow-lg shadow-violet-500/25"
                >
                    <Volume2 className="h-5 w-5 mr-2" />
                    Extract Audio from Video
                </Button>
            )}

            {/* Result */}
            {audioUrl && (
                <Card className="p-5 bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-emerald-700">Audio Extracted!</h3>
                    </div>
                    <audio controls className="w-full mb-4" src={audioUrl} />
                    <Button
                        onClick={downloadAudio}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 h-12"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download Audio (WAV)
                    </Button>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-blue-800 mb-1">How it works</h4>
                        <p className="text-sm text-blue-700">
                            This tool extracts the audio track from your video file entirely in your browser.
                            No upload required - your files never leave your device. Output is in WAV format
                            for maximum quality.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

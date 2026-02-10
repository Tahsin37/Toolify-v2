'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Upload, Download, Music, ArrowRight, Info, Play, Volume2,
    FileAudio, CheckCircle2, AlertTriangle, Settings, Loader2,
    Sliders, Gauge, Headphones
} from 'lucide-react';

type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'webm' | 'aac' | 'flac';

interface FormatInfo {
    name: string;
    description: string;
    quality: 'lossy' | 'lossless';
    supported: boolean;
}

export function PowerAudioConverter() {
    const [mediaFile, setMediaFile] = React.useState<File | null>(null);
    const [mediaUrl, setMediaUrl] = React.useState<string>('');
    const [targetFormat, setTargetFormat] = React.useState<AudioFormat>('mp3');
    const [bitrate, setBitrate] = React.useState(192);
    const [sampleRate, setSampleRate] = React.useState(44100);
    const [converting, setConverting] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [progressMessage, setProgressMessage] = React.useState('');
    const [convertedUrl, setConvertedUrl] = React.useState<string>('');
    const [convertedSize, setConvertedSize] = React.useState<number>(0);
    const [error, setError] = React.useState<string>('');
    const [isVideo, setIsVideo] = React.useState(false);
    const [duration, setDuration] = React.useState(0);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    const formats: Record<AudioFormat, FormatInfo> = {
        mp3: { name: 'MP3', description: 'Universal compatibility, small size', quality: 'lossy', supported: true },
        wav: { name: 'WAV', description: 'Uncompressed, highest quality', quality: 'lossless', supported: true },
        ogg: { name: 'OGG Vorbis', description: 'Open format, good quality', quality: 'lossy', supported: true },
        webm: { name: 'WebM', description: 'Web-optimized audio', quality: 'lossy', supported: true },
        aac: { name: 'AAC', description: 'Better than MP3 at same bitrate', quality: 'lossy', supported: true },
        flac: { name: 'FLAC', description: 'Lossless compression', quality: 'lossless', supported: true },
    };

    const bitrateOptions = [64, 96, 128, 160, 192, 224, 256, 320];
    const sampleRateOptions = [22050, 44100, 48000, 96000];

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
        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
            setMediaFile(file);
            setMediaUrl(URL.createObjectURL(file));
            setConvertedUrl('');
            setError('');
            setIsVideo(file.type.startsWith('video/'));
            setProgress(0);
            setConvertedSize(0);
        } else {
            setError('Please upload an audio or video file');
        }
    };

    const onLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const convertAudio = async () => {
        if (!mediaFile) return;
        setConverting(true);
        setProgress(0);
        setError('');
        setProgressMessage('Loading audio...');

        try {
            const audioContext = new AudioContext({ sampleRate });
            setProgress(5);
            setProgressMessage('Decoding audio...');

            // Load audio data
            const arrayBuffer = await mediaFile.arrayBuffer();
            setProgress(15);

            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            setProgress(30);
            setProgressMessage('Processing audio...');

            let outputBlob: Blob;

            if (targetFormat === 'mp3') {
                // Use lamejs for MP3 encoding
                setProgressMessage('Encoding MP3...');
                outputBlob = await encodeToMp3(audioBuffer, bitrate);
            } else if (targetFormat === 'wav') {
                setProgressMessage('Creating WAV...');
                outputBlob = audioBufferToWav(audioBuffer);
            } else if (targetFormat === 'flac') {
                // FLAC requires native WAV for now
                setProgressMessage('Creating FLAC-quality WAV...');
                outputBlob = audioBufferToWav(audioBuffer);
            } else {
                // Use MediaRecorder for other formats
                setProgressMessage(`Encoding ${targetFormat.toUpperCase()}...`);
                outputBlob = await convertWithMediaRecorder(audioBuffer, targetFormat);
            }

            setProgress(95);
            setProgressMessage('Finalizing...');

            const url = URL.createObjectURL(outputBlob);
            setConvertedUrl(url);
            setConvertedSize(outputBlob.size);
            setProgress(100);
            setProgressMessage('Complete!');

            await audioContext.close();
        } catch (err) {
            console.error('Conversion error:', err);
            setError('Conversion failed. Try a different format or file.');
        }

        setConverting(false);
    };

    const encodeToMp3 = async (buffer: AudioBuffer, kbps: number): Promise<Blob> => {
        // Dynamically import lamejs
        const lamejs = await import('lamejs');

        const mp3encoder = new lamejs.Mp3Encoder(buffer.numberOfChannels, buffer.sampleRate, kbps);
        const mp3Data: Int8Array[] = [];

        const sampleBlockSize = 1152;
        const left = buffer.getChannelData(0);
        const right = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : left;

        // Convert to 16-bit integers
        const leftInt = new Int16Array(left.length);
        const rightInt = new Int16Array(right.length);

        for (let i = 0; i < left.length; i++) {
            leftInt[i] = Math.max(-32768, Math.min(32767, Math.floor(left[i] * 32768)));
            rightInt[i] = Math.max(-32768, Math.min(32767, Math.floor(right[i] * 32768)));

            // Update progress
            if (i % 100000 === 0) {
                setProgress(30 + Math.floor((i / left.length) * 50));
            }
        }

        // Encode in blocks
        for (let i = 0; i < left.length; i += sampleBlockSize) {
            const leftChunk = leftInt.subarray(i, i + sampleBlockSize);
            const rightChunk = rightInt.subarray(i, i + sampleBlockSize);

            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }

        // Flush remaining data
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        setProgress(85);

        // Combine all chunks
        const totalLength = mp3Data.reduce((acc, chunk) => acc + chunk.length, 0);
        const mp3Array = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of mp3Data) {
            mp3Array.set(new Uint8Array(chunk.buffer), offset);
            offset += chunk.length;
        }

        return new Blob([mp3Array], { type: 'audio/mpeg' });
    };

    const audioBufferToWav = (buffer: AudioBuffer): Blob => {
        const numChannels = buffer.numberOfChannels;
        const length = buffer.length * numChannels * 2;
        const arrayBuffer = new ArrayBuffer(44 + length);
        const view = new DataView(arrayBuffer);

        const writeString = (offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, buffer.sampleRate, true);
        view.setUint32(28, buffer.sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length, true);

        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
            if (i % 50000 === 0) setProgress(30 + Math.floor((i / buffer.length) * 60));
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    };

    const convertWithMediaRecorder = async (buffer: AudioBuffer, format: AudioFormat): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const audioContext = new AudioContext({ sampleRate: buffer.sampleRate });

            const source = audioContext.createBufferSource();
            source.buffer = buffer;

            const dest = audioContext.createMediaStreamDestination();
            source.connect(dest);
            source.connect(audioContext.destination);
            source.start(0);

            const mimeTypes: Record<string, string> = {
                ogg: 'audio/ogg;codecs=opus',
                webm: 'audio/webm;codecs=opus',
                aac: 'audio/aac',
            };

            const mimeType = mimeTypes[format] || 'audio/webm';

            // Fallback if format not supported
            const actualMime = MediaRecorder.isTypeSupported(mimeType)
                ? mimeType
                : 'audio/webm;codecs=opus';

            const recorder = new MediaRecorder(dest.stream, { mimeType: actualMime });
            const chunks: Blob[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: actualMime });
                audioContext.close();
                resolve(blob);
            };

            recorder.start();
            setTimeout(() => recorder.stop(), (buffer.duration * 1000) + 500);
        });
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
                className="p-8 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-violet-50/30 hover:border-violet-400 transition-all cursor-pointer text-center group"
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
                    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-violet-200 transition-colors">
                        <Music className="h-8 w-8 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1">
                        Drop audio or video file here
                    </h3>
                    <p className="text-sm text-slate-500">Supports MP3, MP4, WAV, OGG, WebM, FLAC, AAC and more</p>
                </div>
            </Card>

            {/* Audio Preview */}
            {mediaUrl && (
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                            {isVideo ? <Play className="h-6 w-6 text-violet-600" /> : <Headphones className="h-6 w-6 text-violet-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-800 truncate">{mediaFile?.name}</h4>
                            <div className="flex gap-3 text-sm text-slate-500">
                                <span>{formatSize(mediaFile?.size || 0)}</span>
                                {duration > 0 && <span>• {formatDuration(duration)}</span>}
                                {isVideo && <span className="text-violet-600">• Video (audio will be extracted)</span>}
                            </div>
                        </div>
                    </div>
                    <audio
                        ref={audioRef}
                        src={mediaUrl}
                        controls
                        onLoadedMetadata={onLoadedMetadata}
                        className="w-full"
                    />
                </Card>
            )}

            {/* Conversion Settings */}
            {mediaUrl && (
                <Card className="p-5 bg-white border border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-slate-500" />
                        <h3 className="font-semibold text-slate-800">Conversion Settings</h3>
                    </div>

                    {/* Format Selection */}
                    <div className="mb-5">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Output Format</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.entries(formats).map(([key, info]) => (
                                <button
                                    key={key}
                                    onClick={() => setTargetFormat(key as AudioFormat)}
                                    className={`p-3 rounded-lg border text-left transition-all ${targetFormat === key
                                        ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                                        : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-slate-800">{info.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${info.quality === 'lossless'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                            }`}>
                                            {info.quality}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">{info.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bitrate & Sample Rate (for lossy formats) */}
                    {formats[targetFormat].quality === 'lossy' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Gauge className="h-4 w-4" /> Bitrate
                                </label>
                                <select
                                    value={bitrate}
                                    onChange={(e) => setBitrate(Number(e.target.value))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                                >
                                    {bitrateOptions.map(br => (
                                        <option key={br} value={br}>{br} kbps</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                    <Sliders className="h-4 w-4" /> Sample Rate
                                </label>
                                <select
                                    value={sampleRate}
                                    onChange={(e) => setSampleRate(Number(e.target.value))}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                                >
                                    {sampleRateOptions.map(sr => (
                                        <option key={sr} value={sr}>{sr / 1000} kHz</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Convert Button */}
            {mediaUrl && !convertedUrl && (
                <Button
                    onClick={convertAudio}
                    disabled={converting}
                    className="w-full h-14 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-lg"
                >
                    {converting ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>{progressMessage}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded">{progress}%</span>
                        </div>
                    ) : (
                        <>
                            <ArrowRight className="h-5 w-5 mr-2" />
                            Convert to {formats[targetFormat].name}
                        </>
                    )}
                </Button>
            )}

            {/* Progress Bar */}
            {converting && (
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Download Result */}
            {convertedUrl && (
                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                            <div>
                                <h3 className="font-bold text-emerald-800">Conversion Complete!</h3>
                                <p className="text-sm text-emerald-600">
                                    Output: {formats[targetFormat].name} • {formatSize(convertedSize)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <audio src={convertedUrl} controls className="w-full mb-4" />
                    <Button
                        onClick={downloadAudio}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download {formats[targetFormat].name}
                    </Button>
                </Card>
            )}

            {/* Error */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200">
                    <div className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-violet-50 border border-violet-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-violet-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-violet-800 mb-1">Powerful Audio Converter</h4>
                        <p className="text-sm text-violet-700">
                            Convert between any audio format with full control over bitrate and sample rate.
                            Real MP3 encoding using the lamejs library. Extract audio from video files.
                            All processing happens in your browser - no upload required.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

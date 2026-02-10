'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Volume2, Play, Pause, Info, Settings, StopCircle, AlertTriangle
} from 'lucide-react';

export function TextToSpeech() {
    const [text, setText] = React.useState('Hello! Welcome to the Text to Speech converter. Type or paste any text and click play to hear it spoken aloud.');
    const [speaking, setSpeaking] = React.useState(false);
    const [paused, setPaused] = React.useState(false);
    const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = React.useState<string>('');
    const [rate, setRate] = React.useState(1);
    const [pitch, setPitch] = React.useState(1);
    const [volume, setVolume] = React.useState(1);
    const [voiceError, setVoiceError] = React.useState('');

    // Robust voice loading with retry for Google voices
    React.useEffect(() => {
        let retryCount = 0;
        const maxRetries = 10;

        const loadVoices = () => {
            const available = speechSynthesis.getVoices();
            if (available.length === 0 && retryCount < maxRetries) {
                retryCount++;
                setTimeout(loadVoices, 300);
                return;
            }

            setVoices(available);

            if (available.length === 0) {
                setVoiceError('No voices available. Please check your browser settings.');
                return;
            }

            setVoiceError('');

            if (!selectedVoice || !available.find(v => v.name === selectedVoice)) {
                // Prefer Google English voices
                const googleEn = available.find(v => v.name.includes('Google') && v.lang.startsWith('en'));
                const anyEnglish = available.find(v => v.lang.startsWith('en'));
                const best = googleEn || anyEnglish || available[0];
                setSelectedVoice(best.name);
            }
        };

        loadVoices();
        speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            speechSynthesis.cancel();
            speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    const speak = () => {
        if (!text.trim()) return;

        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) utterance.voice = voice;

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;

        utterance.onstart = () => {
            setSpeaking(true);
            setPaused(false);
        };
        utterance.onend = () => {
            setSpeaking(false);
            setPaused(false);
        };
        utterance.onerror = (e) => {
            setSpeaking(false);
            setPaused(false);
            if (e.error !== 'interrupted') {
                setVoiceError(`Speech error: ${e.error}. Try selecting a different voice.`);
            }
        };

        speechSynthesis.speak(utterance);
    };

    const togglePause = () => {
        if (speechSynthesis.paused) {
            speechSynthesis.resume();
            setPaused(false);
        } else {
            speechSynthesis.pause();
            setPaused(true);
        }
    };

    const stop = () => {
        speechSynthesis.cancel();
        setSpeaking(false);
        setPaused(false);
    };

    // Group voices by language
    const groupedVoices = React.useMemo(() => {
        const groups: Record<string, SpeechSynthesisVoice[]> = {};
        for (const voice of voices) {
            const lang = voice.lang.split('-')[0].toUpperCase();
            if (!groups[lang]) groups[lang] = [];
            groups[lang].push(voice);
        }
        return groups;
    }, [voices]);

    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    const charCount = text.length;
    const estimatedTime = Math.ceil(wordCount / (150 * rate));

    return (
        <div className="space-y-6">
            {/* Text Input */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Volume2 className="h-4 w-4 mr-2 text-indigo-500" />
                    Enter Text to Speak
                </h3>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste text here..."
                    className="w-full h-40 p-3 border border-slate-300 rounded-lg resize-none text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-500">
                        {wordCount} words • {charCount} characters • ~{estimatedTime}s at {rate}x speed
                    </span>
                </div>
            </Card>

            {/* Voice Settings */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-indigo-500" />
                    Voice Settings
                </h3>

                {voiceError && (
                    <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span className="text-sm text-amber-700">{voiceError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Voice ({voices.length} available)
                        </label>
                        <select
                            value={selectedVoice}
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500"
                        >
                            {Object.entries(groupedVoices).sort().map(([lang, langVoices]) => (
                                <optgroup key={lang} label={lang}>
                                    {langVoices.map((voice) => (
                                        <option key={voice.name} value={voice.name} className="text-slate-900 bg-white">
                                            {voice.name} {voice.localService ? '(Local)' : '(Network)'}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Speed: {rate.toFixed(1)}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Pitch: {pitch.toFixed(1)}
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="2"
                            step="0.1"
                            value={pitch}
                            onChange={(e) => setPitch(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                            Volume: {Math.round(volume * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                    </div>
                </div>
            </Card>

            {/* Controls */}
            <Card className="p-5 bg-white border border-slate-200">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    <Button
                        onClick={speak}
                        disabled={!text.trim() || voices.length === 0}
                        className="bg-indigo-600 hover:bg-indigo-700 px-8"
                    >
                        <Play className="h-5 w-5 mr-2" />
                        {speaking ? 'Restart' : 'Play'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={togglePause}
                        disabled={!speaking}
                    >
                        <Pause className="h-5 w-5 mr-2" />
                        {paused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={stop}
                        disabled={!speaking}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                        <StopCircle className="h-5 w-5 mr-2" />
                        Stop
                    </Button>
                </div>
                {speaking && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <div className="flex gap-1">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-indigo-500 rounded-full animate-pulse"
                                    style={{
                                        height: `${12 + Math.random() * 12}px`,
                                        animationDelay: `${i * 0.1}s`
                                    }}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-indigo-600 ml-2">
                            {paused ? 'Paused' : 'Speaking...'}
                        </span>
                    </div>
                )}
            </Card>

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Text to Speech</h4>
                        <p className="text-sm text-indigo-700">
                            Convert text to speech using your browser&apos;s built-in speech synthesis.
                            Choose from available voices (including Google voices), adjust speed, pitch, and volume.
                            All processing happens locally in your browser — works offline with local voices.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Timer, RotateCcw, Info, Trophy, Target, Zap, Clock, BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PARAGRAPHS: Record<string, string[]> = {
    'Easy': [
        "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump. The five boxing wizards jump quickly at dawn.",
        "The sun was shining and the birds were singing. It was a beautiful day to go for a walk in the park. The flowers were blooming and the trees were green.",
        "She went to the store to buy some milk and bread. The weather was nice so she decided to walk. On her way home she stopped to pet a friendly dog.",
        "The cat sat on the mat and looked out the window. It was raining outside and the streets were wet. A red car drove by and splashed water on the sidewalk.",
    ],
    'Medium': [
        "Programming is the art of telling a computer what to do. Good code is its own best documentation. When you feel the need to write a comment, first try to refactor the code so that any comment becomes unnecessary.",
        "The internet has revolutionized the way we communicate, learn, and work. From social media to cloud computing, technology continues to evolve at an unprecedented pace, shaping the future of our digital world.",
        "Time management is the key to productivity. By setting clear goals, prioritizing tasks, and eliminating distractions, you can accomplish more in less time. Remember, every minute counts when building something great.",
        "The beauty of open source software lies in its collaborative nature. Developers from around the world contribute their skills and knowledge to create tools that benefit everyone. This spirit of sharing drives innovation forward.",
        "Writing clean and maintainable code requires discipline and practice. Follow established patterns, use meaningful variable names, and always think about the developer who will read your code next. Simplicity is the ultimate sophistication.",
        "The mountains towered above the valley, their snow-capped peaks glistening in the morning sun. A gentle breeze carried the scent of pine trees through the air, while birds sang their melodious songs from hidden perches in the forest canopy.",
    ],
    'Hard': [
        "Artificial intelligence and machine learning are transforming industries across the globe. From healthcare to finance, these technologies offer powerful solutions that can analyze vast amounts of data and make predictions with remarkable accuracy.",
        "The implementation of distributed consensus algorithms, such as Raft and Paxos, requires careful consideration of network partitions, Byzantine fault tolerance, and eventual consistency guarantees across heterogeneous compute clusters.",
        "Quantum entanglement demonstrates that measuring one particle instantaneously affects its entangled counterpart, regardless of the distance separating them; Einstein famously referred to this phenomenon as \"spooky action at a distance.\"",
        "The archaeological excavation revealed unprecedented artifacts: obsidian microliths, chryselephantine figurines, and cuneiform tablets describing Mesopotamian jurisprudence — findings that fundamentally reshape our understanding of Bronze Age civilization.",
    ],
};

const DIFFICULTIES = Object.keys(PARAGRAPHS);

const DURATIONS = [
    { label: '15s', value: 15 },
    { label: '30s', value: 30 },
    { label: '60s', value: 60 },
    { label: '120s', value: 120 },
];

export function TypingTest() {
    const [targetText, setTargetText] = React.useState('');
    const [typedText, setTypedText] = React.useState('');
    const [duration, setDuration] = React.useState(60);
    const [timeLeft, setTimeLeft] = React.useState(60);
    const [isRunning, setIsRunning] = React.useState(false);
    const [isFinished, setIsFinished] = React.useState(false);
    const [startTime, setStartTime] = React.useState<number | null>(null);
    const [difficulty, setDifficulty] = React.useState('Medium');
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Initialize with random paragraph
    React.useEffect(() => {
        pickNewText();
    }, []);

    const pickNewText = (diff?: string) => {
        const pool = PARAGRAPHS[diff || difficulty];
        const idx = Math.floor(Math.random() * pool.length);
        setTargetText(pool[idx]);
    };

    // Timer logic
    React.useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(t => t - 1);
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            finishTest();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isRunning, timeLeft]);

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;

        // Start timer on first keystroke
        if (!isRunning && !isFinished) {
            setIsRunning(true);
            setStartTime(Date.now());
        }

        if (isFinished) return;

        setTypedText(value);

        // Auto-finish if completed the entire text
        if (value.length >= targetText.length) {
            finishTest();
        }
    };

    const finishTest = () => {
        setIsRunning(false);
        setIsFinished(true);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const reset = () => {
        setTypedText('');
        setIsRunning(false);
        setIsFinished(false);
        setTimeLeft(duration);
        setStartTime(null);
        pickNewText();
        if (timerRef.current) clearTimeout(timerRef.current);
        inputRef.current?.focus();
    };

    const changeDifficulty = (newDifficulty: string) => {
        setDifficulty(newDifficulty);
        setTypedText('');
        setIsRunning(false);
        setIsFinished(false);
        setTimeLeft(duration);
        setStartTime(null);
        pickNewText(newDifficulty);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const changeDuration = (newDuration: number) => {
        setDuration(newDuration);
        setTimeLeft(newDuration);
        setTypedText('');
        setIsRunning(false);
        setIsFinished(false);
        setStartTime(null);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    // Calculate stats
    const calculateStats = () => {
        const elapsed = startTime ? (duration - timeLeft) : 0;
        const elapsedMinutes = elapsed / 60 || 1 / 60; // avoid division by zero

        let correctChars = 0;
        let wrongChars = 0;
        const typed = typedText.length;

        for (let i = 0; i < typed; i++) {
            if (i < targetText.length && typedText[i] === targetText[i]) {
                correctChars++;
            } else {
                wrongChars++;
            }
        }

        // WPM = (correct chars / 5) / elapsed minutes
        const wpm = Math.round((correctChars / 5) / elapsedMinutes);
        const accuracy = typed > 0 ? Math.round((correctChars / typed) * 100) : 100;
        const rawWpm = Math.round((typed / 5) / elapsedMinutes);

        return {
            wpm: Math.max(0, wpm),
            rawWpm: Math.max(0, rawWpm),
            accuracy,
            correctChars,
            wrongChars,
            totalChars: typed,
            elapsed: Math.round(elapsed),
        };
    };

    const stats = calculateStats();

    // Render highlighted text
    const renderTargetText = () => {
        return targetText.split('').map((char, i) => {
            let className = 'text-slate-400'; // upcoming

            if (i < typedText.length) {
                if (typedText[i] === char) {
                    className = 'text-emerald-600 bg-emerald-50'; // correct
                } else {
                    className = 'text-red-600 bg-red-100'; // wrong
                }
            } else if (i === typedText.length) {
                className = 'text-slate-800 bg-indigo-100 border-l-2 border-indigo-500'; // cursor position
            }

            return (
                <span key={i} className={className}>
                    {char}
                </span>
            );
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6">
            {/* Difficulty & Duration */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 mr-1">Level:</span>
                    {DIFFICULTIES.map(d => (
                        <Button
                            key={d}
                            size="sm"
                            variant={difficulty === d ? 'primary' : 'outline'}
                            onClick={() => changeDifficulty(d)}
                            disabled={isRunning}
                            className={cn(
                                difficulty === d
                                    ? d === 'Easy' ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : d === 'Medium' ? 'bg-amber-600 hover:bg-amber-700'
                                            : 'bg-rose-600 hover:bg-rose-700'
                                    : ''
                            )}
                        >
                            {d}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm text-slate-600 mr-2">Duration:</span>
                    {DURATIONS.map(d => (
                        <Button
                            key={d.value}
                            size="sm"
                            variant={duration === d.value ? 'primary' : 'outline'}
                            onClick={() => changeDuration(d.value)}
                            disabled={isRunning}
                            className={duration === d.value ? 'bg-indigo-600' : ''}
                        >
                            {d.label}
                        </Button>
                    ))}
                </div>
                <div className={`text-3xl font-mono font-bold ${timeLeft <= 10 && isRunning ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Live Stats (during test) */}
            {(isRunning || isFinished) && (
                <div className="grid grid-cols-3 gap-4">
                    <Card className="p-3 bg-white border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-indigo-600">{stats.wpm}</div>
                        <div className="text-xs text-slate-500">WPM</div>
                    </Card>
                    <Card className="p-3 bg-white border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-emerald-600">{stats.accuracy}%</div>
                        <div className="text-xs text-slate-500">Accuracy</div>
                    </Card>
                    <Card className="p-3 bg-white border border-slate-200 text-center">
                        <div className="text-2xl font-bold text-amber-600">{stats.totalChars}</div>
                        <div className="text-xs text-slate-500">Characters</div>
                    </Card>
                </div>
            )}

            {/* Target Text Display */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-indigo-500" />
                    Text to Type
                </h3>
                <div className="font-mono text-lg leading-relaxed tracking-wide select-none p-4 bg-slate-50 rounded-lg border border-slate-200">
                    {renderTargetText()}
                </div>
            </Card>

            {/* Typing Input */}
            <Card className="p-5 bg-white border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-indigo-500" />
                    {isFinished ? 'Test Complete!' : isRunning ? 'Keep typing...' : 'Start typing below'}
                </h3>
                <textarea
                    ref={inputRef}
                    value={typedText}
                    onChange={handleTyping}
                    disabled={isFinished}
                    placeholder={isFinished ? 'Test complete! Click restart to try again.' : 'Click here and start typing to begin the test...'}
                    className="w-full h-28 p-3 border border-slate-300 rounded-lg resize-none text-slate-900 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    autoFocus
                    spellCheck={false}
                    autoComplete="off"
                    autoCapitalize="off"
                />
            </Card>

            {/* Results Card (when finished) */}
            {isFinished && (
                <Card className="p-6 bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-200">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy className="h-6 w-6 text-amber-500" />
                        <h3 className="text-lg font-bold text-slate-800">Test Results</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
                            <div className="text-3xl font-bold text-indigo-600">{stats.wpm}</div>
                            <div className="text-xs text-slate-500 mt-1">Words Per Minute</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
                            <div className="text-3xl font-bold text-emerald-600">{stats.accuracy}%</div>
                            <div className="text-xs text-slate-500 mt-1">Accuracy</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
                            <div className="text-3xl font-bold text-green-600">{stats.correctChars}</div>
                            <div className="text-xs text-slate-500 mt-1">Correct Chars</div>
                        </div>
                        <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
                            <div className="text-3xl font-bold text-red-500">{stats.wrongChars}</div>
                            <div className="text-xs text-slate-500 mt-1">Wrong Chars</div>
                        </div>
                    </div>
                    <div className="text-sm text-slate-600 mt-4 text-center">
                        Raw WPM: {stats.rawWpm} • Time: {stats.elapsed}s • Total: {stats.totalChars} characters typed
                    </div>
                </Card>
            )}

            {/* Controls */}
            <div className="flex justify-center">
                <Button variant="outline" onClick={reset} className="px-8">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {isFinished ? 'Try Again' : 'Restart'}
                </Button>
            </div>

            {/* Info */}
            <Card className="p-4 bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-indigo-800 mb-1">Typing Speed Test</h4>
                        <p className="text-sm text-indigo-700">
                            Test your typing speed and accuracy. Choose a duration (30s, 60s, or 120s),
                            then start typing the displayed text. Your WPM is calculated as (correct characters / 5) per minute.
                            Green characters are correct, red are mistakes. The test ends when time runs out or you complete the text.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

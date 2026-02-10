'use client';

import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { countWords } from '@/lib/utils/text-analysis';
import { cn } from '@/lib/utils';
import { Clock, BookOpen, Mic } from 'lucide-react';

function useWordCount(text: string) {
    const [stats, setStats] = React.useState({
        words: 0,
        characters: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: '0 min',
        speakingTime: '0 min',
    });

    React.useEffect(() => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        const characters = text.length;
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        const paragraphs = text.split(/\n+/).filter(p => p.trim().length > 0).length;

        // Avg reading speed: 200 wpm
        const readTimeMinutes = Math.ceil(words / 200);
        // Avg speaking speed: 130 wpm
        const speakTimeMinutes = Math.ceil(words / 130);

        setStats({
            words,
            characters,
            sentences,
            paragraphs,
            readingTime: `${readTimeMinutes} min`,
            speakingTime: `${speakTimeMinutes} min`,
        });
    }, [text]);

    return stats;
}

export function WordCounter() {
    const [text, setText] = React.useState('');
    const stats = useWordCount(text);

    return (
        <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Words" value={stats.words} />
                <StatCard label="Characters" value={stats.characters} />
                <StatCard label="Sentences" value={stats.sentences} />
                <StatCard label="Paragraphs" value={stats.paragraphs} />
            </div>

            {/* Input Area */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Editor</span>
                    <button
                        onClick={() => setText('')}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                        Clear
                    </button>
                </div>
                <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="min-h-[300px] border-0 rounded-none bg-white resize-y focus-visible:ring-0 p-6 text-lg leading-relaxed text-slate-900 placeholder:text-slate-400"
                />
            </Card>

            {/* Time Estimates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-blue-50/50 border border-blue-100 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm text-blue-600/80 font-medium">Reading Time</div>
                        <div className="text-xl font-bold text-blue-900">{stats.readingTime}</div>
                    </div>
                </Card>

                <Card className="p-6 bg-indigo-50/50 border border-indigo-100 flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Mic className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="text-sm text-indigo-600/80 font-medium">Speaking Time</div>
                        <div className="text-xl font-bold text-indigo-900">{stats.speakingTime}</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: number }) {
    return (
        <Card className="p-6 bg-white border border-slate-200 text-center hover:border-indigo-200 hover:shadow-md transition-all shadow-sm">
            <div className="text-3xl font-bold text-slate-900 mb-1">{value.toLocaleString()}</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">{label}</div>
        </Card>
    );
}

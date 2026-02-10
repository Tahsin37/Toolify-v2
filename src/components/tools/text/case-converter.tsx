'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { convertAllCases, detectCase } from '@/lib/tools/text/case-converter';
import { cn } from '@/lib/utils';
import { Copy, Check, Type } from 'lucide-react';

const CASE_TYPES = [
    { key: 'uppercase', label: 'UPPERCASE', icon: 'AA' },
    { key: 'lowercase', label: 'lowercase', icon: 'aa' },
    { key: 'titlecase', label: 'Title Case', icon: 'Aa' },
    { key: 'sentencecase', label: 'Sentence case', icon: 'A.' },
    { key: 'camelcase', label: 'camelCase', icon: 'aB' },
    { key: 'pascalcase', label: 'PascalCase', icon: 'AB' },
    { key: 'snakecase', label: 'snake_case', icon: 'a_b' },
    { key: 'kebabcase', label: 'kebab-case', icon: 'a-b' },
    { key: 'togglecase', label: 'tOGGLE cASE', icon: 'aA' },
];

export function CaseConverter() {
    const [input, setInput] = React.useState('');
    const [conversions, setConversions] = React.useState<Record<string, string>>({});
    const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
    const [detectedCase, setDetectedCase] = React.useState<string>('');

    React.useEffect(() => {
        if (input.trim()) {
            const results = convertAllCases(input);
            setConversions(results);
            setDetectedCase(detectCase(input));
        } else {
            setConversions({});
            setDetectedCase('');
        }
    }, [input]);

    const handleCopy = (key: string, value: string) => {
        navigator.clipboard.writeText(value);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">Enter Text to Convert</label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type or paste your text here..."
                    className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-base"
                />
                {detectedCase && (
                    <p className="mt-2 text-sm text-slate-500">
                        Detected case: <span className="font-medium text-indigo-600">{detectedCase}</span>
                    </p>
                )}
            </Card>

            {/* Conversions Grid */}
            {input.trim() && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CASE_TYPES.map(({ key, label, icon }) => (
                        <Card
                            key={key}
                            className={cn(
                                "p-4 bg-white border shadow-sm transition-all hover:shadow-md cursor-pointer group",
                                detectedCase === key ? "border-indigo-300 bg-indigo-50" : "border-slate-200"
                            )}
                            onClick={() => handleCopy(key, conversions[key] || '')}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{icon}</span>
                                    <span className="text-sm font-medium text-slate-700">{label}</span>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    {copiedKey === key ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-slate-400" />
                                    )}
                                </button>
                            </div>
                            <p className="text-sm text-slate-900 break-words line-clamp-3 font-mono bg-slate-50 p-2 rounded">
                                {conversions[key] || ''}
                            </p>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!input.trim() && (
                <Card className="p-12 bg-slate-50 border border-dashed border-slate-300 text-center">
                    <Type className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Enter Text to Convert</h3>
                    <p className="text-sm text-slate-500">All case variations will appear here</p>
                </Card>
            )}
        </div>
    );
}

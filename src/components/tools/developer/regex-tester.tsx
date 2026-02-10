'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { testRegex, getCommonPatterns, explainFlags } from '@/lib/tools/developer/regex-tester';
import { cn } from '@/lib/utils';
import { Search, CheckCircle2, XCircle, Copy, Check, Lightbulb } from 'lucide-react';

export function RegexTester() {
    const [pattern, setPattern] = React.useState('');
    const [flags, setFlags] = React.useState('g');
    const [testString, setTestString] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [showPatterns, setShowPatterns] = React.useState(false);
    const commonPatterns = getCommonPatterns();

    // Real-time testing
    React.useEffect(() => {
        if (pattern && testString) {
            const data = testRegex({ pattern, testString, flags });
            if (data.success) {
                setResult(data.data);
            }
        } else {
            setResult(null);
        }
    }, [pattern, testString, flags]);

    const highlightMatches = () => {
        if (!result || !result.isValid || result.matchCount === 0) return testString;

        let highlighted = testString;
        let offset = 0;

        result.matches.forEach((match: any) => {
            const start = match.index + offset;
            const end = start + match.match.length;
            const before = highlighted.substring(0, start);
            const matched = highlighted.substring(start, end);
            const after = highlighted.substring(end);
            const replacement = `<mark class="bg-amber-200 text-amber-900 px-0.5 rounded">${matched}</mark>`;
            highlighted = before + replacement + after;
            offset += replacement.length - match.match.length;
        });

        return highlighted;
    };

    const loadPattern = (key: string) => {
        setPattern(commonPatterns[key].pattern);
        setShowPatterns(false);
    };

    const toggleFlag = (flag: string) => {
        if (flags.includes(flag)) {
            setFlags(flags.replace(flag, ''));
        } else {
            setFlags(flags + flag);
        }
    };

    return (
        <div className="space-y-6">
            {/* Pattern Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm space-y-4">
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-medium text-slate-700">Regular Expression</label>
                        <Button variant="ghost" size="sm" onClick={() => setShowPatterns(!showPatterns)} className="text-xs">
                            <Lightbulb className="h-3 w-3 mr-1" /> Common Patterns
                        </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-slate-400 font-mono text-lg">/</span>
                        <Input
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value)}
                            placeholder="[a-zA-Z]+"
                            className="font-mono flex-1"
                        />
                        <span className="text-slate-400 font-mono text-lg">/</span>
                        <Input
                            value={flags}
                            onChange={(e) => setFlags(e.target.value)}
                            className="font-mono w-16 text-center"
                            maxLength={6}
                        />
                    </div>
                </div>

                {/* Common Patterns Dropdown */}
                {showPatterns && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-lg">
                        {Object.entries(commonPatterns).map(([key, { description }]) => (
                            <button
                                key={key}
                                onClick={() => loadPattern(key)}
                                className="text-xs text-left p-2 bg-white rounded border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                            >
                                <span className="font-medium text-slate-900">{key}</span>
                                <span className="block text-slate-500 truncate">{description}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Flags */}
                <div className="flex flex-wrap gap-2">
                    {['g', 'i', 'm', 's'].map(flag => (
                        <button
                            key={flag}
                            onClick={() => toggleFlag(flag)}
                            className={cn(
                                "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                                flags.includes(flag)
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                        >
                            {flag} - {explainFlags(flag)[0]}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Test String */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <label className="block text-sm font-medium text-slate-700 mb-2">Test String</label>
                <textarea
                    value={testString}
                    onChange={(e) => setTestString(e.target.value)}
                    placeholder="Enter text to test against the pattern..."
                    className="w-full h-32 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                />
            </Card>

            {/* Result */}
            {result && (
                <>
                    {/* Status */}
                    <Card className={cn(
                        "p-4 border shadow-sm",
                        !result.isValid ? "bg-rose-50 border-rose-200" :
                            result.matchCount > 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {!result.isValid ? (
                                    <XCircle className="h-6 w-6 text-rose-600" />
                                ) : result.matchCount > 0 ? (
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                ) : (
                                    <Search className="h-6 w-6 text-amber-600" />
                                )}
                                <div>
                                    <h3 className={cn(
                                        "font-bold",
                                        !result.isValid ? "text-rose-800" :
                                            result.matchCount > 0 ? "text-emerald-800" : "text-amber-800"
                                    )}>
                                        {!result.isValid ? 'Invalid Pattern' :
                                            result.matchCount > 0 ? `${result.matchCount} Match${result.matchCount > 1 ? 'es' : ''}` : 'No Matches'}
                                    </h3>
                                    {result.error && <p className="text-sm text-rose-700">{result.error}</p>}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Highlighted Text */}
                    {result.isValid && result.matchCount > 0 && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-3">Highlighted Matches</h4>
                            <div
                                className="p-3 bg-slate-50 rounded-lg font-mono text-sm whitespace-pre-wrap break-words"
                                dangerouslySetInnerHTML={{ __html: highlightMatches() }}
                            />
                        </Card>
                    )}

                    {/* Match Details */}
                    {result.isValid && result.matches.length > 0 && (
                        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-900 mb-3">Match Details</h4>
                            <div className="max-h-48 overflow-y-auto space-y-2">
                                {result.matches.map((match: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs text-slate-500 font-mono">#{i + 1}</span>
                                            <code className="text-sm text-indigo-600 font-medium">{match.match}</code>
                                        </div>
                                        <span className="text-xs text-slate-500">index: {match.index}</span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

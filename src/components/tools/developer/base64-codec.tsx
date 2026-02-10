'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { processBase64, getBase64Info, isValidBase64 } from '@/lib/tools/developer/base64-codec';
import { cn } from '@/lib/utils';
import { Lock, Unlock, Copy, Check, ArrowRightLeft, Info } from 'lucide-react';

export function Base64Codec() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [operation, setOperation] = React.useState<'encode' | 'decode'>('encode');
    const [urlSafe, setUrlSafe] = React.useState(false);
    const [error, setError] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [info, setInfo] = React.useState<any>(null);

    const handleProcess = () => {
        if (!input.trim()) return;
        const result = processBase64({ input, operation, urlSafe });
        if (result.success && result.data) {
            if (result.data.isValid) {
                setOutput(result.data.output);
                setError('');
                if (operation === 'encode') {
                    setInfo(getBase64Info(input));
                } else {
                    setInfo(null);
                }
            } else {
                setOutput('');
                setError(result.data.error || 'Invalid input');
                setInfo(null);
            }
        }
    };

    const handleSwap = () => {
        setOperation(op => op === 'encode' ? 'decode' : 'encode');
        setInput(output);
        setOutput('');
        setError('');
        setInfo(null);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Real-time processing
    React.useEffect(() => {
        if (input.trim()) {
            handleProcess();
        } else {
            setOutput('');
            setError('');
            setInfo(null);
        }
    }, [input, operation, urlSafe]);

    return (
        <div className="space-y-6">
            {/* Operation Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setOperation('encode')}
                        className={cn(
                            "flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            operation === 'encode' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <Lock className="h-4 w-4" />
                        <span>Encode</span>
                    </button>
                    <button
                        onClick={() => setOperation('decode')}
                        className={cn(
                            "flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            operation === 'decode' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <Unlock className="h-4 w-4" />
                        <span>Decode</span>
                    </button>
                </div>
            </div>

            {/* Options */}
            <div className="flex justify-center">
                <label className="flex items-center space-x-2 text-sm text-slate-700">
                    <input
                        type="checkbox"
                        checked={urlSafe}
                        onChange={(e) => setUrlSafe(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>URL-Safe Base64</span>
                </label>
            </div>

            {/* Input/Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-700">
                            {operation === 'encode' ? 'Plain Text' : 'Base64 Encoded'}
                        </span>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={operation === 'encode' ? 'Enter text to encode...' : 'Enter Base64 to decode...'}
                        className="w-full h-48 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                            {operation === 'encode' ? 'Base64 Encoded' : 'Plain Text'}
                        </span>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={handleSwap} className="text-xs">
                                <ArrowRightLeft className="h-3 w-3 mr-1" /> Swap
                            </Button>
                            {output && (
                                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                                    {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                    {copied ? 'Copied' : 'Copy'}
                                </Button>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={error || output}
                        readOnly
                        className={cn(
                            "w-full h-48 px-4 py-3 bg-slate-50 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0",
                            error ? "text-rose-600" : "text-slate-900"
                        )}
                    />
                </Card>
            </div>

            {/* Encoding Info */}
            {info && (
                <Card className="p-4 bg-blue-50 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <span className="text-blue-600 font-medium">Input Length</span>
                                <span className="block text-slate-700">{info.inputLength} chars</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Encoded Length</span>
                                <span className="block text-slate-700">{info.encodedLength} chars</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Size Ratio</span>
                                <span className="block text-slate-700">{info.ratio}x</span>
                            </div>
                            <div>
                                <span className="text-blue-600 font-medium">Byte Size</span>
                                <span className="block text-slate-700">{info.byteSize} bytes</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

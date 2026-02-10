'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { processURL, parseURL, getURLEncodingInfo } from '@/lib/tools/developer/url-codec';
import { cn } from '@/lib/utils';
import { Link2, Copy, Check, ArrowRightLeft, Info } from 'lucide-react';

export function UrlCodec() {
    const [input, setInput] = React.useState('');
    const [output, setOutput] = React.useState('');
    const [operation, setOperation] = React.useState<'encode' | 'decode'>('encode');
    const [encodeMode, setEncodeMode] = React.useState<'component' | 'full' | 'space-only'>('component');
    const [error, setError] = React.useState('');
    const [copied, setCopied] = React.useState(false);
    const [urlInfo, setUrlInfo] = React.useState<any>(null);

    // Real-time processing
    React.useEffect(() => {
        if (!input.trim()) {
            setOutput('');
            setError('');
            setUrlInfo(null);
            return;
        }

        const result = processURL({ input, operation, encodeMode });
        if (result.success && result.data) {
            if (result.data.isValid) {
                setOutput(result.data.output);
                setError('');

                // Parse URL info for decode operation
                if (operation === 'decode') {
                    const parsed = parseURL(result.data.output);
                    setUrlInfo(parsed.isValid ? parsed : null);
                } else {
                    const info = getURLEncodingInfo(input);
                    setUrlInfo(info);
                }
            } else {
                setOutput('');
                setError(result.data.error || 'Invalid input');
                setUrlInfo(null);
            }
        }
    }, [input, operation, encodeMode]);

    const handleSwap = () => {
        setOperation(op => op === 'encode' ? 'decode' : 'encode');
        setInput(output);
        setOutput('');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                        <span>Encode</span>
                    </button>
                    <button
                        onClick={() => setOperation('decode')}
                        className={cn(
                            "flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            operation === 'decode' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                        )}
                    >
                        <span>Decode</span>
                    </button>
                </div>
            </div>

            {/* Encode Mode (only for encoding) */}
            {operation === 'encode' && (
                <div className="flex justify-center space-x-4">
                    {['component', 'full', 'space-only'].map((mode) => (
                        <label key={mode} className="flex items-center space-x-2 text-sm text-slate-700">
                            <input
                                type="radio"
                                name="encodeMode"
                                checked={encodeMode === mode}
                                onChange={() => setEncodeMode(mode as any)}
                                className="text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="capitalize">{mode.replace('-', ' ')}</span>
                        </label>
                    ))}
                </div>
            )}

            {/* Input/Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-sm font-medium text-slate-700">
                            {operation === 'encode' ? 'Plain Text / URL' : 'URL Encoded'}
                        </span>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={operation === 'encode' ? 'Enter text or URL to encode...' : 'Enter URL encoded string...'}
                        className="w-full h-40 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                    />
                </Card>

                <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">
                            {operation === 'encode' ? 'URL Encoded' : 'Decoded'}
                        </span>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={handleSwap} className="text-xs">
                                <ArrowRightLeft className="h-3 w-3 mr-1" /> Swap
                            </Button>
                            {output && (
                                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            )}
                        </div>
                    </div>
                    <textarea
                        value={error || output}
                        readOnly
                        className={cn(
                            "w-full h-40 px-4 py-3 bg-slate-50 focus:outline-none font-mono text-sm resize-none border-0",
                            error ? "text-rose-600" : "text-slate-900"
                        )}
                    />
                </Card>
            </div>

            {/* Encoding Info */}
            {urlInfo && operation === 'encode' && urlInfo.encodedLength && (
                <Card className="p-4 bg-blue-50 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-slate-700">
                                <strong>{urlInfo.percentEncoded}</strong> character{urlInfo.percentEncoded !== 1 ? 's' : ''} encoded
                                {urlInfo.specialChars.length > 0 && (
                                    <span> • Special chars: <code className="bg-white px-1 rounded">{urlInfo.specialChars.join(' ')}</code></span>
                                )}
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* URL Components (for decode) */}
            {urlInfo && operation === 'decode' && urlInfo.isValid && (
                <Card className="p-4 bg-white border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center">
                        <Link2 className="h-4 w-4 mr-2 text-indigo-600" /> URL Components
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {urlInfo.protocol && <Field label="Protocol" value={urlInfo.protocol} />}
                        {urlInfo.hostname && <Field label="Hostname" value={urlInfo.hostname} />}
                        {urlInfo.port && <Field label="Port" value={urlInfo.port} />}
                        {urlInfo.pathname && <Field label="Pathname" value={urlInfo.pathname} />}
                        {urlInfo.search && <Field label="Search" value={urlInfo.search} />}
                        {urlInfo.hash && <Field label="Hash" value={urlInfo.hash} />}
                    </div>
                    {urlInfo.searchParams && Object.keys(urlInfo.searchParams).length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-200">
                            <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Query Parameters</h5>
                            <div className="space-y-1">
                                {Object.entries(urlInfo.searchParams).map(([key, value]) => (
                                    <div key={key} className="flex justify-between p-2 bg-slate-50 rounded">
                                        <code className="text-indigo-600 font-medium">{key}</code>
                                        <code className="text-slate-700">{value as string}</code>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="p-2 bg-slate-50 rounded">
            <span className="text-xs text-slate-500">{label}</span>
            <code className="block text-slate-900 truncate">{value}</code>
        </div>
    );
}

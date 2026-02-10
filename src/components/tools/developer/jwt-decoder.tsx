'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { decodeJWT, getJWTExpirationStatus, getAlgorithmInfo, explainClaim } from '@/lib/tools/developer/jwt-decoder';
import { cn } from '@/lib/utils';
import { Key, Clock, Shield, AlertTriangle, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

export function JwtDecoder() {
    const [token, setToken] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [expStatus, setExpStatus] = React.useState<any>(null);
    const [algInfo, setAlgInfo] = React.useState<any>(null);
    const [copied, setCopied] = React.useState<string | null>(null);
    const [expandedSection, setExpandedSection] = React.useState<'header' | 'payload' | 'signature' | null>('payload');

    // Real-time decoding
    React.useEffect(() => {
        if (token.trim()) {
            const data = decodeJWT({ token });
            if (data.success && data.data) {
                setResult(data.data);
                if (data.data.isValid) {
                    setExpStatus(getJWTExpirationStatus(token));
                    if (data.data.header?.alg) {
                        setAlgInfo(getAlgorithmInfo(data.data.header.alg));
                    }
                }
            }
        } else {
            setResult(null);
            setExpStatus(null);
            setAlgInfo(null);
        }
    }, [token]);

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const formatTimestamp = (ts: number) => {
        return new Date(ts * 1000).toLocaleString();
    };

    return (
        <div className="space-y-6">
            {/* Token Input */}
            <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-700">JWT Token</span>
                </div>
                <textarea
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full h-28 px-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none font-mono text-sm resize-none border-0"
                />
            </Card>

            {result && (
                <>
                    {/* Status */}
                    <Card className={cn(
                        "p-4 border shadow-sm",
                        result.isValid
                            ? expStatus?.isExpired ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"
                            : "bg-rose-50 border-rose-200"
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {result.isValid ? (
                                    expStatus?.isExpired ? (
                                        <Clock className="h-6 w-6 text-rose-600" />
                                    ) : (
                                        <Shield className="h-6 w-6 text-emerald-600" />
                                    )
                                ) : (
                                    <AlertTriangle className="h-6 w-6 text-rose-600" />
                                )}
                                <div>
                                    <h3 className={cn(
                                        "font-bold",
                                        result.isValid && !expStatus?.isExpired ? "text-emerald-800" : "text-rose-800"
                                    )}>
                                        {!result.isValid ? 'Invalid JWT' : expStatus?.isExpired ? 'Token Expired' : 'Valid JWT'}
                                    </h3>
                                    {result.error && <p className="text-sm text-rose-700">{result.error}</p>}
                                    {expStatus?.expiresIn && !expStatus.isExpired && (
                                        <p className="text-sm text-emerald-700">Expires in {expStatus.expiresIn}</p>
                                    )}
                                </div>
                            </div>
                            {algInfo && (
                                <div className="text-right">
                                    <span className="text-xs text-slate-500">Algorithm</span>
                                    <span className="block font-bold text-slate-900">{result.header?.alg}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    {result.isValid && (
                        <>
                            {/* Header Section */}
                            <JWTSection
                                title="Header"
                                color="indigo"
                                isExpanded={expandedSection === 'header'}
                                onToggle={() => setExpandedSection(expandedSection === 'header' ? null : 'header')}
                                onCopy={() => handleCopy(JSON.stringify(result.header, null, 2), 'header')}
                                copied={copied === 'header'}
                            >
                                <pre className="text-sm font-mono text-slate-700 overflow-x-auto">
                                    {JSON.stringify(result.header, null, 2)}
                                </pre>
                                {algInfo && (
                                    <div className="mt-3 p-2 bg-indigo-100 rounded text-sm text-indigo-800">
                                        <strong>{algInfo.name}</strong> ({algInfo.type}) - {algInfo.description}
                                    </div>
                                )}
                            </JWTSection>

                            {/* Payload Section */}
                            <JWTSection
                                title="Payload"
                                color="emerald"
                                isExpanded={expandedSection === 'payload'}
                                onToggle={() => setExpandedSection(expandedSection === 'payload' ? null : 'payload')}
                                onCopy={() => handleCopy(JSON.stringify(result.payload, null, 2), 'payload')}
                                copied={copied === 'payload'}
                            >
                                <div className="space-y-2">
                                    {Object.entries(result.payload || {}).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-start p-2 bg-white rounded border border-slate-100">
                                            <div>
                                                <code className="text-sm font-bold text-emerald-600">{key}</code>
                                                <p className="text-xs text-slate-500">{explainClaim(key)}</p>
                                            </div>
                                            <code className="text-sm text-slate-700 text-right max-w-[50%] break-all">
                                                {['exp', 'iat', 'nbf'].includes(key) && typeof value === 'number'
                                                    ? formatTimestamp(value as number)
                                                    : typeof value === 'object' ? JSON.stringify(value) : String(value)
                                                }
                                            </code>
                                        </div>
                                    ))}
                                </div>
                            </JWTSection>

                            {/* Signature Section */}
                            <JWTSection
                                title="Signature"
                                color="amber"
                                isExpanded={expandedSection === 'signature'}
                                onToggle={() => setExpandedSection(expandedSection === 'signature' ? null : 'signature')}
                                onCopy={() => handleCopy(result.signature || '', 'signature')}
                                copied={copied === 'signature'}
                            >
                                <code className="text-sm font-mono text-slate-700 break-all">
                                    {result.signature}
                                </code>
                                <p className="mt-2 text-xs text-slate-500">
                                    ⚠️ Signature cannot be verified client-side without the secret key.
                                </p>
                            </JWTSection>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

function JWTSection({
    title,
    color,
    isExpanded,
    onToggle,
    onCopy,
    copied,
    children
}: {
    title: string;
    color: 'indigo' | 'emerald' | 'amber';
    isExpanded: boolean;
    onToggle: () => void;
    onCopy: () => void;
    copied: boolean;
    children: React.ReactNode;
}) {
    const colors = {
        indigo: 'bg-indigo-50 border-indigo-200',
        emerald: 'bg-emerald-50 border-emerald-200',
        amber: 'bg-amber-50 border-amber-200',
    };
    const textColors = {
        indigo: 'text-indigo-800',
        emerald: 'text-emerald-800',
        amber: 'text-amber-800',
    };

    return (
        <Card className={cn("border shadow-sm overflow-hidden", colors[color])}>
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={onToggle}
            >
                <h4 className={cn("font-bold", textColors[color])}>{title}</h4>
                <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onCopy(); }}>
                        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </div>
            {isExpanded && (
                <div className="px-4 pb-4">
                    {children}
                </div>
            )}
        </Card>
    );
}

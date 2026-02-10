'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parseUserAgent, getCommonUserAgents } from '@/lib/tools/web/user-agent-parser';
import { cn } from '@/lib/utils';
import { Globe, Monitor, Smartphone, Tablet, Bot, Copy, Check, ChevronDown } from 'lucide-react';

export function UserAgentParser() {
    const [userAgent, setUserAgent] = React.useState('');
    const [result, setResult] = React.useState<any>(null);
    const [copied, setCopied] = React.useState(false);
    const [showPresets, setShowPresets] = React.useState(false);
    const commonUAs = getCommonUserAgents();

    // Auto-detect on load
    React.useEffect(() => {
        if (typeof navigator !== 'undefined') {
            setUserAgent(navigator.userAgent);
        }
    }, []);

    React.useEffect(() => {
        if (userAgent.trim()) {
            const data = parseUserAgent({ userAgent });
            if (data.success && data.data) {
                setResult(data.data);
            }
        } else {
            setResult(null);
        }
    }, [userAgent]);

    const handleCopy = () => {
        navigator.clipboard.writeText(userAgent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadPreset = (ua: string) => {
        setUserAgent(ua);
        setShowPresets(false);
    };

    const getDeviceIcon = () => {
        if (!result) return <Globe className="h-8 w-8 text-slate-400" />;
        switch (result.device.type) {
            case 'mobile': return <Smartphone className="h-8 w-8 text-indigo-600" />;
            case 'tablet': return <Tablet className="h-8 w-8 text-indigo-600" />;
            case 'bot': return <Bot className="h-8 w-8 text-amber-600" />;
            default: return <Monitor className="h-8 w-8 text-indigo-600" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <Card className="p-6 bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">User-Agent String</label>
                    <div className="flex space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPresets(!showPresets)}
                            className="text-xs"
                        >
                            Presets <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCopy} className="text-xs">
                            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                    </div>
                </div>
                <textarea
                    value={userAgent}
                    onChange={(e) => setUserAgent(e.target.value)}
                    placeholder="Paste a user-agent string..."
                    className="w-full h-20 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                />

                {/* Presets */}
                {showPresets && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-1 gap-2">
                            {commonUAs.map((ua, i) => (
                                <button
                                    key={i}
                                    onClick={() => loadPreset(ua.userAgent)}
                                    className="text-left p-2 bg-white rounded border border-slate-200 hover:border-indigo-500 transition-colors"
                                >
                                    <span className="text-sm font-medium text-slate-900">{ua.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            {result && (
                <>
                    {/* Device Card */}
                    <Card className={cn(
                        "p-6 border shadow-sm",
                        result.isBot ? "bg-amber-50 border-amber-200" : "bg-indigo-50 border-indigo-200"
                    )}>
                        <div className="flex items-center space-x-4">
                            {getDeviceIcon()}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-slate-900">
                                    {result.browser.name} {result.browser.major}
                                </h3>
                                <p className="text-sm text-slate-600">
                                    {result.os.name} {result.os.version} • {result.device.type}
                                    {result.device.vendor && ` • ${result.device.vendor}`}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DetailCard title="Browser">
                            <Field label="Name" value={result.browser.name} />
                            <Field label="Version" value={result.browser.version} />
                            <Field label="Major" value={result.browser.major} />
                        </DetailCard>

                        <DetailCard title="Operating System">
                            <Field label="Name" value={result.os.name} />
                            <Field label="Version" value={result.os.version || 'Unknown'} />
                        </DetailCard>

                        <DetailCard title="Device">
                            <Field label="Type" value={result.device.type} />
                            <Field label="Vendor" value={result.device.vendor || 'Unknown'} />
                            <Field label="Model" value={result.device.model || 'Unknown'} />
                        </DetailCard>

                        <DetailCard title="Engine">
                            <Field label="Name" value={result.engine.name} />
                            <Field label="Version" value={result.engine.version || 'Unknown'} />
                            <Field label="Is Bot" value={result.isBot ? 'Yes' : 'No'} highlight={result.isBot} />
                        </DetailCard>
                    </div>
                </>
            )}
        </div>
    );
}

function DetailCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Card className="p-4 bg-white border border-slate-200 shadow-sm">
            <h4 className="font-bold text-slate-900 mb-3">{title}</h4>
            <div className="space-y-2">{children}</div>
        </Card>
    );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div className="flex justify-between p-2 bg-slate-50 rounded text-sm">
            <span className="text-slate-600">{label}</span>
            <span className={cn("font-medium", highlight ? "text-amber-600" : "text-slate-900")}>{value}</span>
        </div>
    );
}

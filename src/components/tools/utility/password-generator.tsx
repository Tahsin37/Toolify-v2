'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';

export function PasswordGenerator() {
    const [password, setPassword] = React.useState('');
    const [length, setLength] = React.useState(16);
    const [includeUppercase, setIncludeUppercase] = React.useState(true);
    const [includeLowercase, setIncludeLowercase] = React.useState(true);
    const [includeNumbers, setIncludeNumbers] = React.useState(true);
    const [includeSymbols, setIncludeSymbols] = React.useState(true);
    const [excludeSimilar, setExcludeSimilar] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(true);

    const generatePassword = React.useCallback(() => {
        let charset = '';
        const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        const lowercase = 'abcdefghjkmnpqrstuvwxyz';
        const numbers = '23456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const similarChars = 'IlO01';

        if (includeUppercase) charset += uppercase + (excludeSimilar ? '' : 'IO');
        if (includeLowercase) charset += lowercase + (excludeSimilar ? '' : 'lo');
        if (includeNumbers) charset += numbers + (excludeSimilar ? '' : '01');
        if (includeSymbols) charset += symbols;

        if (!charset) {
            setPassword('Please select at least one option');
            return;
        }

        let newPassword = '';
        const array = new Uint32Array(length);
        crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            newPassword += charset[array[i] % charset.length];
        }

        setPassword(newPassword);
    }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar]);

    React.useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStrength = (): { label: string; color: string; width: string } => {
        let score = 0;
        if (length >= 12) score++;
        if (length >= 16) score++;
        if (length >= 20) score++;
        if (includeUppercase) score++;
        if (includeLowercase) score++;
        if (includeNumbers) score++;
        if (includeSymbols) score++;

        if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
        if (score <= 4) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
        if (score <= 6) return { label: 'Strong', color: 'bg-emerald-500', width: '75%' };
        return { label: 'Very Strong', color: 'bg-emerald-600', width: '100%' };
    };

    const strength = getStrength();

    return (
        <div className="space-y-6">
            {/* Password Display */}
            <Card className="p-6 bg-slate-900 border border-slate-700">
                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            readOnly
                            className="w-full bg-transparent text-xl font-mono text-white outline-none pr-10"
                        />
                        <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                    <Button
                        onClick={copyToClipboard}
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                    >
                        {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                    </Button>
                    <Button
                        onClick={generatePassword}
                        variant="ghost"
                        className="text-slate-400 hover:text-white"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </Button>
                </div>

                {/* Strength Indicator */}
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-400">Strength</span>
                        <span className="text-xs text-slate-400">{strength.label}</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${strength.color} transition-all duration-300`}
                            style={{ width: strength.width }}
                        />
                    </div>
                </div>
            </Card>

            {/* Length Slider */}
            <Card className="p-4 bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">Length</label>
                    <span className="text-lg font-bold text-indigo-600">{length}</span>
                </div>
                <input
                    type="range"
                    min={6}
                    max={64}
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>6</span>
                    <span>64</span>
                </div>
            </Card>

            {/* Options */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Character Types</h3>
                <div className="space-y-3">
                    {[
                        { id: 'uppercase', label: 'Uppercase (A-Z)', state: includeUppercase, setter: setIncludeUppercase },
                        { id: 'lowercase', label: 'Lowercase (a-z)', state: includeLowercase, setter: setIncludeLowercase },
                        { id: 'numbers', label: 'Numbers (0-9)', state: includeNumbers, setter: setIncludeNumbers },
                        { id: 'symbols', label: 'Symbols (!@#$%)', state: includeSymbols, setter: setIncludeSymbols },
                    ].map(option => (
                        <label key={option.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                            <span className="text-sm text-slate-700">{option.label}</span>
                            <input
                                type="checkbox"
                                checked={option.state}
                                onChange={(e) => option.setter(e.target.checked)}
                                className="w-5 h-5 accent-indigo-600 cursor-pointer"
                            />
                        </label>
                    ))}
                </div>
            </Card>

            {/* Advanced Options */}
            <Card className="p-4 bg-white border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-4">Advanced</h3>
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                    <div>
                        <span className="text-sm text-slate-700">Exclude Similar Characters</span>
                        <p className="text-xs text-slate-500">Avoid l, 1, I, 0, O</p>
                    </div>
                    <input
                        type="checkbox"
                        checked={excludeSimilar}
                        onChange={(e) => setExcludeSimilar(e.target.checked)}
                        className="w-5 h-5 accent-indigo-600 cursor-pointer"
                    />
                </label>
            </Card>

            {/* Generate Button */}
            <Button
                onClick={generatePassword}
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
                <Lock className="h-5 w-5 mr-2" />
                Generate New Password
            </Button>
        </div>
    );
}

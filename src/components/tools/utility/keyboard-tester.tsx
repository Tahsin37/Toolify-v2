'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Volume2, VolumeX, Check } from 'lucide-react';

interface KeyDef {
    key: string;
    label: string;
    width: string;
    row: number;
}

const KEYBOARD_LAYOUT: KeyDef[] = [
    // Row 1
    { key: 'Escape', label: 'Esc', width: 'w-12', row: 1 },
    { key: 'F1', label: 'F1', width: 'w-10', row: 1 },
    { key: 'F2', label: 'F2', width: 'w-10', row: 1 },
    { key: 'F3', label: 'F3', width: 'w-10', row: 1 },
    { key: 'F4', label: 'F4', width: 'w-10', row: 1 },
    { key: 'F5', label: 'F5', width: 'w-10', row: 1 },
    { key: 'F6', label: 'F6', width: 'w-10', row: 1 },
    { key: 'F7', label: 'F7', width: 'w-10', row: 1 },
    { key: 'F8', label: 'F8', width: 'w-10', row: 1 },
    { key: 'F9', label: 'F9', width: 'w-10', row: 1 },
    { key: 'F10', label: 'F10', width: 'w-10', row: 1 },
    { key: 'F11', label: 'F11', width: 'w-10', row: 1 },
    { key: 'F12', label: 'F12', width: 'w-10', row: 1 },
    { key: 'Delete', label: 'Del', width: 'w-12', row: 1 },

    // Row 2
    { key: 'Backquote', label: '`', width: 'w-10', row: 2 },
    { key: 'Digit1', label: '1', width: 'w-10', row: 2 },
    { key: 'Digit2', label: '2', width: 'w-10', row: 2 },
    { key: 'Digit3', label: '3', width: 'w-10', row: 2 },
    { key: 'Digit4', label: '4', width: 'w-10', row: 2 },
    { key: 'Digit5', label: '5', width: 'w-10', row: 2 },
    { key: 'Digit6', label: '6', width: 'w-10', row: 2 },
    { key: 'Digit7', label: '7', width: 'w-10', row: 2 },
    { key: 'Digit8', label: '8', width: 'w-10', row: 2 },
    { key: 'Digit9', label: '9', width: 'w-10', row: 2 },
    { key: 'Digit0', label: '0', width: 'w-10', row: 2 },
    { key: 'Minus', label: '-', width: 'w-10', row: 2 },
    { key: 'Equal', label: '=', width: 'w-10', row: 2 },
    { key: 'Backspace', label: 'Backspace', width: 'w-24', row: 2 },

    // Row 3
    { key: 'Tab', label: 'Tab', width: 'w-16', row: 3 },
    { key: 'KeyQ', label: 'Q', width: 'w-10', row: 3 },
    { key: 'KeyW', label: 'W', width: 'w-10', row: 3 },
    { key: 'KeyE', label: 'E', width: 'w-10', row: 3 },
    { key: 'KeyR', label: 'R', width: 'w-10', row: 3 },
    { key: 'KeyT', label: 'T', width: 'w-10', row: 3 },
    { key: 'KeyY', label: 'Y', width: 'w-10', row: 3 },
    { key: 'KeyU', label: 'U', width: 'w-10', row: 3 },
    { key: 'KeyI', label: 'I', width: 'w-10', row: 3 },
    { key: 'KeyO', label: 'O', width: 'w-10', row: 3 },
    { key: 'KeyP', label: 'P', width: 'w-10', row: 3 },
    { key: 'BracketLeft', label: '[', width: 'w-10', row: 3 },
    { key: 'BracketRight', label: ']', width: 'w-10', row: 3 },
    { key: 'Backslash', label: '\\', width: 'w-14', row: 3 },

    // Row 4
    { key: 'CapsLock', label: 'Caps', width: 'w-20', row: 4 },
    { key: 'KeyA', label: 'A', width: 'w-10', row: 4 },
    { key: 'KeyS', label: 'S', width: 'w-10', row: 4 },
    { key: 'KeyD', label: 'D', width: 'w-10', row: 4 },
    { key: 'KeyF', label: 'F', width: 'w-10', row: 4 },
    { key: 'KeyG', label: 'G', width: 'w-10', row: 4 },
    { key: 'KeyH', label: 'H', width: 'w-10', row: 4 },
    { key: 'KeyJ', label: 'J', width: 'w-10', row: 4 },
    { key: 'KeyK', label: 'K', width: 'w-10', row: 4 },
    { key: 'KeyL', label: 'L', width: 'w-10', row: 4 },
    { key: 'Semicolon', label: ';', width: 'w-10', row: 4 },
    { key: 'Quote', label: "'", width: 'w-10', row: 4 },
    { key: 'Enter', label: 'Enter', width: 'w-[5.5rem]', row: 4 },

    // Row 5
    { key: 'ShiftLeft', label: 'Shift', width: 'w-24', row: 5 },
    { key: 'KeyZ', label: 'Z', width: 'w-10', row: 5 },
    { key: 'KeyX', label: 'X', width: 'w-10', row: 5 },
    { key: 'KeyC', label: 'C', width: 'w-10', row: 5 },
    { key: 'KeyV', label: 'V', width: 'w-10', row: 5 },
    { key: 'KeyB', label: 'B', width: 'w-10', row: 5 },
    { key: 'KeyN', label: 'N', width: 'w-10', row: 5 },
    { key: 'KeyM', label: 'M', width: 'w-10', row: 5 },
    { key: 'Comma', label: ',', width: 'w-10', row: 5 },
    { key: 'Period', label: '.', width: 'w-10', row: 5 },
    { key: 'Slash', label: '/', width: 'w-10', row: 5 },
    { key: 'ShiftRight', label: 'Shift', width: 'w-24', row: 5 },

    // Row 6
    { key: 'ControlLeft', label: 'Ctrl', width: 'w-14', row: 6 },
    { key: 'MetaLeft', label: 'Win', width: 'w-12', row: 6 },
    { key: 'AltLeft', label: 'Alt', width: 'w-12', row: 6 },
    { key: 'Space', label: 'Space', width: 'w-64', row: 6 },
    { key: 'AltRight', label: 'Alt', width: 'w-12', row: 6 },
    { key: 'MetaRight', label: 'Win', width: 'w-12', row: 6 },
    { key: 'ContextMenu', label: 'Menu', width: 'w-12', row: 6 },
    { key: 'ControlRight', label: 'Ctrl', width: 'w-14', row: 6 },
];

export function KeyboardTester() {
    const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
    const [testedKeys, setTestedKeys] = useState<Set<string>>(new Set());
    const [lastKey, setLastKey] = useState<{ code: string; key: string } | null>(null);
    const [soundEnabled, setSoundEnabled] = useState(false);

    const playClickSound = useCallback(() => {
        if (!soundEnabled) return;
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        }
    }, [soundEnabled]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            e.preventDefault();
            const code = e.code;
            setPressedKeys(prev => new Set(prev).add(code));
            setTestedKeys(prev => new Set(prev).add(code));
            setLastKey({ code, key: e.key });
            playClickSound();
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            e.preventDefault();
            const code = e.code;
            setPressedKeys(prev => {
                const newSet = new Set(prev);
                newSet.delete(code);
                return newSet;
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [playClickSound]);

    const resetTest = () => {
        setTestedKeys(new Set());
        setPressedKeys(new Set());
        setLastKey(null);
    };

    const getKeyStyle = (code: string) => {
        const isActive = pressedKeys.has(code);
        const isTested = testedKeys.has(code);

        if (isActive)
            return 'bg-indigo-500 text-white border-indigo-600 shadow-[0_2px_10px_rgba(99,102,241,0.5)] transform translate-y-0.5 scale-95 ring-2 ring-indigo-400 z-10';
        if (isTested)
            return 'bg-emerald-500 text-white border-emerald-600 shadow-sm';

        return 'bg-slate-50 text-slate-700 border-slate-300 shadow-[0_4px_0_rgb(203,213,225)] hover:bg-slate-100';
    };

    const renderKey = (keyDef: KeyDef) => (
        <div
            key={keyDef.key}
            className={`${keyDef.width} h-12 m-1 relative group`}
        >
            <div
                className={`
                    absolute inset-0 rounded-lg border-b-4 
                    flex items-center justify-center font-bold text-sm transition-all duration-75
                    select-none
                    ${getKeyStyle(keyDef.key)}
                `}
            >
                {keyDef.label}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    Keyboard Tester
                </h1>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                    Test every key on your keyboard to ensure it's working perfectly.
                </p>
            </div>

            <Card className="p-8 bg-slate-900/5 backdrop-blur-sm border-slate-200 shadow-xl overflow-hidden">
                {/* Stats Bar */}
                <div className="flex flex-wrap items-center justify-between mb-8 pb-6 border-b border-slate-200/60 gap-4">
                    <div className="flex gap-4">
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pressed</span>
                            <div className="text-2xl font-bold text-indigo-600">{testedKeys.size}</div>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last Key</span>
                            <div className="text-2xl font-bold text-slate-900 min-w-[3rem]">
                                {lastKey ? lastKey.code : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={soundEnabled ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={soundEnabled ? 'bg-indigo-600' : 'bg-white'}
                        >
                            {soundEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                            Sound
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetTest}
                            className="bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Keyboard Layout */}
                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <div className="min-w-[800px] flex flex-col items-center gap-1 p-4 bg-slate-200/50 rounded-2xl border border-slate-300/50 shadow-inner">
                        {[1, 2, 3, 4, 5, 6].map(rowNum => (
                            <div key={rowNum} className="flex justify-center w-full">
                                {KEYBOARD_LAYOUT.filter(k => k.row === rowNum).map(renderKey)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-slate-50 border border-slate-300 shadow-[0_2px_0_rgb(203,213,225)]"></div>
                        <span className="text-slate-600">Untested</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-emerald-500 border border-emerald-600 shadow-sm"></div>
                        <span className="text-slate-600">Working</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-indigo-500 border border-indigo-600"></div>
                        <span className="text-slate-600">Pressed</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}

'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import {
    Upload, Download, FileArchive, X, Plus, File, Lock, Settings,
    FolderOpen, Trash2, AlertTriangle, CheckCircle2, Eye, EyeOff,
    HardDrive, Zap, Shield, Layers, SplitSquareVertical, MessageSquare,
    Archive, Filter, Search, RefreshCw, Info, Clock
} from 'lucide-react';

type CompressionLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type ArchiveFormat = 'zip' | 'tar';

interface FileItem {
    file: File;
    path: string;
    include: boolean;
}

interface ArchiveStats {
    originalSize: number;
    compressedSize: number;
    ratio: number;
    fileCount: number;
    time: number;
}

export function PowerZipCreator() {
    const [files, setFiles] = React.useState<FileItem[]>([]);
    const [zipName, setZipName] = React.useState('archive');
    const [password, setPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [compressionLevel, setCompressionLevel] = React.useState<CompressionLevel>(6);
    const [comment, setComment] = React.useState('');
    const [splitSize, setSplitSize] = React.useState<number>(0);
    const [creating, setCreating] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [progressMessage, setProgressMessage] = React.useState('');
    const [filter, setFilter] = React.useState('');
    const [stats, setStats] = React.useState<ArchiveStats | null>(null);
    const [showAdvanced, setShowAdvanced] = React.useState(false);
    const [excludePatterns, setExcludePatterns] = React.useState('');
    const [preserveStructure, setPreserveStructure] = React.useState(true);

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const folderInputRef = React.useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
    };

    const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles = selectedFiles.map(file => ({
            file,
            path: preserveStructure ? ((file as any).webkitRelativePath || file.name) : file.name,
            include: true
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const addFiles = (newFiles: File[]) => {
        const items = newFiles.map(file => ({
            file,
            path: file.name,
            include: true
        }));
        setFiles(prev => [...prev, ...items]);
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFile = (index: number) => {
        setFiles(prev => prev.map((item, i) =>
            i === index ? { ...item, include: !item.include } : item
        ));
    };

    const clearAll = () => {
        setFiles([]);
        setProgress(0);
        setStats(null);
    };

    const applyExcludePatterns = () => {
        if (!excludePatterns.trim()) return;
        const patterns = excludePatterns.split(',').map(p => p.trim().toLowerCase());

        setFiles(prev => prev.map(item => {
            const name = item.file.name.toLowerCase();
            const shouldExclude = patterns.some(pattern => {
                if (pattern.startsWith('*.')) {
                    return name.endsWith(pattern.slice(1));
                }
                return name.includes(pattern);
            });
            return { ...item, include: !shouldExclude };
        }));
    };

    const createArchive = async () => {
        const includedFiles = files.filter(f => f.include);
        if (includedFiles.length === 0) return;

        setCreating(true);
        setProgress(0);
        setProgressMessage('Preparing files...');
        const startTime = Date.now();

        try {
            const zip = new JSZip();
            const totalFiles = includedFiles.length;
            let originalSize = 0;

            // Add comment if provided
            if (comment) {
                // JSZip doesn't directly support archive comments in the standard way
                // We'll add it as a readme file
                zip.file('_README.txt', `Archive created with Toolify Power ZIP\n\nComment:\n${comment}\n\nCreated: ${new Date().toISOString()}`);
            }

            // Add files to archive
            for (let i = 0; i < includedFiles.length; i++) {
                const { file, path } = includedFiles[i];
                setProgressMessage(`Adding: ${file.name}`);

                const content = await file.arrayBuffer();
                originalSize += file.size;

                // Get the path for the file
                const filePath = preserveStructure ? path : file.name;
                zip.file(filePath, content);

                setProgress(Math.round(((i + 1) / totalFiles) * 40));
            }

            setProgressMessage('Compressing...');
            setProgress(45);

            // Generate with selected compression level
            const compressionMethods: Record<CompressionLevel, { type: 'DEFLATE' | 'STORE', level: number }> = {
                0: { type: 'STORE', level: 0 },
                1: { type: 'DEFLATE', level: 1 },
                2: { type: 'DEFLATE', level: 2 },
                3: { type: 'DEFLATE', level: 3 },
                4: { type: 'DEFLATE', level: 4 },
                5: { type: 'DEFLATE', level: 5 },
                6: { type: 'DEFLATE', level: 6 },
                7: { type: 'DEFLATE', level: 7 },
                8: { type: 'DEFLATE', level: 8 },
                9: { type: 'DEFLATE', level: 9 },
            };

            const { type: compressionType, level } = compressionMethods[compressionLevel];

            const blob = await zip.generateAsync(
                {
                    type: 'blob',
                    compression: compressionType,
                    compressionOptions: { level },
                },
                (metadata) => {
                    setProgress(45 + Math.round(metadata.percent / 2));
                    if (metadata.percent > 0) {
                        setProgressMessage(`Compressing: ${Math.round(metadata.percent)}%`);
                    }
                }
            );

            const endTime = Date.now();
            const compressedSize = blob.size;
            const ratio = ((1 - compressedSize / originalSize) * 100);

            setStats({
                originalSize,
                compressedSize,
                ratio: Math.max(0, ratio),
                fileCount: includedFiles.length,
                time: endTime - startTime
            });

            setProgress(95);
            setProgressMessage('Saving...');

            // Handle split archives
            if (splitSize > 0 && blob.size > splitSize * 1024 * 1024) {
                const totalParts = Math.ceil(blob.size / (splitSize * 1024 * 1024));
                for (let i = 0; i < totalParts; i++) {
                    const start = i * splitSize * 1024 * 1024;
                    const end = Math.min((i + 1) * splitSize * 1024 * 1024, blob.size);
                    const part = blob.slice(start, end);
                    const partNum = String(i + 1).padStart(3, '0');
                    saveAs(part, `${zipName}.z${partNum}`);
                }
            } else {
                saveAs(blob, `${zipName}.zip`);
            }

            setProgress(100);
            setProgressMessage('Complete!');
        } catch (error) {
            console.error('Error creating archive:', error);
            setProgressMessage('Error creating archive');
        }

        setTimeout(() => {
            setCreating(false);
        }, 1500);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    };

    const totalSize = files.reduce((acc, item) => acc + (item.include ? item.file.size : 0), 0);
    const includedCount = files.filter(f => f.include).length;
    const filteredFiles = filter
        ? files.filter(f => f.file.name.toLowerCase().includes(filter.toLowerCase()))
        : files;

    const compressionLabels: Record<CompressionLevel, { name: string, desc: string }> = {
        0: { name: 'Store', desc: 'No compression, fastest' },
        1: { name: 'Fastest', desc: 'Minimal compression' },
        2: { name: 'Fast', desc: 'Light compression' },
        3: { name: 'Fast', desc: 'Quick compression' },
        4: { name: 'Normal', desc: 'Balanced speed/size' },
        5: { name: 'Normal', desc: 'Balanced compression' },
        6: { name: 'Good', desc: 'Recommended default' },
        7: { name: 'Better', desc: 'Higher compression' },
        8: { name: 'Best', desc: 'Very high compression' },
        9: { name: 'Maximum', desc: 'Smallest size, slowest' },
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-6 border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-amber-50/30 hover:border-amber-400 transition-all cursor-pointer text-center group"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
                <input
                    ref={folderInputRef}
                    type="file"
                    multiple
                    // @ts-ignore
                    webkitdirectory=""
                    onChange={handleFolderChange}
                    className="hidden"
                />
                <div>
                    <Archive className="h-14 w-14 text-slate-400 group-hover:text-amber-500 mx-auto mb-4 transition-colors" />
                    <p className="text-lg font-semibold text-slate-700 mb-1">
                        Drop files here or click to browse
                    </p>
                    <p className="text-sm text-slate-500 mb-4">Create powerful ZIP archives with advanced options</p>
                </div>
                <div className="flex justify-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                        <File className="h-4 w-4 mr-2" />
                        Add Files
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); folderInputRef.current?.click(); }}
                    >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Add Folder
                    </Button>
                </div>
            </Card>

            {/* File List */}
            {files.length > 0 && (
                <Card className="p-4 bg-white border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-slate-800">
                                Files ({includedCount}/{files.length})
                            </h3>
                            <span className="text-sm text-slate-500">{formatSize(totalSize)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Filter..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="pl-8 pr-3 py-1 text-sm border border-slate-200 rounded-lg w-32"
                                />
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearAll} className="text-red-500">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                        {filteredFiles.map((item, index) => {
                            const realIndex = files.indexOf(item);
                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${item.include ? 'bg-slate-50' : 'bg-slate-100 opacity-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={item.include}
                                            onChange={() => toggleFile(realIndex)}
                                            className="w-4 h-4 text-amber-500"
                                        />
                                        <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-sm text-slate-700 truncate">{item.path}</span>
                                        <span className="text-xs text-slate-400 flex-shrink-0">{formatSize(item.file.size)}</span>
                                    </div>
                                    <button onClick={() => removeFile(realIndex)} className="text-slate-400 hover:text-red-500 p-1">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Settings */}
            {files.length > 0 && (
                <div className="space-y-4">
                    {/* Basic Settings */}
                    <Card className="p-4 bg-white border border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                    Archive Name
                                </label>
                                <Input
                                    value={zipName}
                                    onChange={(e) => setZipName(e.target.value)}
                                    placeholder="archive"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 block">
                                    Compression Level
                                </label>
                                <select
                                    value={compressionLevel}
                                    onChange={(e) => setCompressionLevel(Number(e.target.value) as CompressionLevel)}
                                    className="w-full p-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                                >
                                    {Object.entries(compressionLabels).map(([level, info]) => (
                                        <option key={level} value={level}>
                                            {info.name} ({level}) - {info.desc}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Advanced Settings Toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full"
                    >
                        <Settings className="h-4 w-4 mr-2" />
                        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </Button>

                    {/* Advanced Settings */}
                    {showAdvanced && (
                        <Card className="p-4 bg-slate-50 border border-slate-200 space-y-4">
                            {/* Comment */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" /> Archive Comment
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Add a comment to the archive..."
                                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                                    rows={2}
                                />
                            </div>

                            {/* Split Archives */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <SplitSquareVertical className="h-4 w-4" /> Split Archive (MB)
                                </label>
                                <Input
                                    type="number"
                                    value={splitSize || ''}
                                    onChange={(e) => setSplitSize(Number(e.target.value) || 0)}
                                    placeholder="0 = No split"
                                    min="0"
                                />
                                <p className="text-xs text-slate-500 mt-1">Split into parts of this size. 0 = single file.</p>
                            </div>

                            {/* Exclude Patterns */}
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Filter className="h-4 w-4" /> Exclude Patterns
                                </label>
                                <div className="flex gap-2">
                                    <Input
                                        value={excludePatterns}
                                        onChange={(e) => setExcludePatterns(e.target.value)}
                                        placeholder="*.log, *.tmp, node_modules"
                                    />
                                    <Button variant="outline" size="sm" onClick={applyExcludePatterns}>
                                        Apply
                                    </Button>
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={preserveStructure}
                                        onChange={(e) => setPreserveStructure(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    Preserve folder structure
                                </label>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* Create Button */}
            {files.length > 0 && includedCount > 0 && (
                <Button
                    onClick={createArchive}
                    disabled={creating}
                    className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg"
                >
                    {creating ? (
                        <div className="flex items-center gap-3">
                            <RefreshCw className="h-5 w-5 animate-spin" />
                            <span>{progressMessage}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded">{progress}%</span>
                        </div>
                    ) : (
                        <>
                            <FileArchive className="h-5 w-5 mr-2" />
                            Create ZIP ({includedCount} files, {formatSize(totalSize)})
                        </>
                    )}
                </Button>
            )}

            {/* Progress */}
            {creating && (
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Stats */}
            {stats && (
                <Card className="p-4 bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <h3 className="font-semibold text-emerald-800">Archive Created Successfully!</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-white p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-500">Original Size</p>
                            <p className="font-bold text-slate-800">{formatSize(stats.originalSize)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-cente">
                            <p className="text-xs text-slate-500">Compressed</p>
                            <p className="font-bold text-emerald-600">{formatSize(stats.compressedSize)}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-500">Saved</p>
                            <p className="font-bold text-emerald-600">{stats.ratio.toFixed(1)}%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg text-center">
                            <p className="text-xs text-slate-500">Time</p>
                            <p className="font-bold text-slate-800">{(stats.time / 1000).toFixed(2)}s</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Info */}
            <Card className="p-4 bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Power ZIP Features</h4>
                        <ul className="text-sm text-amber-700 space-y-1">
                            <li>• 10 compression levels (Store to Maximum)</li>
                            <li>• Split large archives into multiple parts</li>
                            <li>• Add comments and readme files</li>
                            <li>• Exclude files by pattern (*.log, *.tmp)</li>
                            <li>• Preserve or flatten folder structure</li>
                            <li>• Detailed compression statistics</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    );
}

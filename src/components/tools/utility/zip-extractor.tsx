'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Upload, Download, FileArchive, Folder, File, CheckCircle2 } from 'lucide-react';

interface ExtractedFile {
    name: string;
    path: string;
    size: number;
    content: Blob;
    isDirectory: boolean;
}

export function ZipExtractor() {
    const [zipFile, setZipFile] = React.useState<File | null>(null);
    const [files, setFiles] = React.useState<ExtractedFile[]>([]);
    const [extracting, setExtracting] = React.useState(false);
    const [extracted, setExtracted] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.name.endsWith('.zip')) {
            setZipFile(file);
            setExtracted(false);
            await extractZip(file);
        }
    };

    const extractZip = async (file: File) => {
        setExtracting(true);
        try {
            const zip = await JSZip.loadAsync(file);
            const extractedFiles: ExtractedFile[] = [];

            for (const [path, zipEntry] of Object.entries(zip.files)) {
                if (!zipEntry.dir) {
                    const content = await zipEntry.async('blob');
                    extractedFiles.push({
                        name: path.split('/').pop() || path,
                        path: path,
                        size: content.size,
                        content: content,
                        isDirectory: false
                    });
                }
            }

            setFiles(extractedFiles);
            setExtracted(true);
        } catch (error) {
            console.error('Error extracting ZIP:', error);
        }
        setExtracting(false);
    };

    const downloadFile = (file: ExtractedFile) => {
        saveAs(file.content, file.name);
    };

    const downloadAll = async () => {
        // Create a new ZIP with all files and download
        const zip = new JSZip();
        for (const file of files) {
            zip.file(file.path, file.content);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        saveAs(blob, `extracted_${zipFile?.name || 'files.zip'}`);
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const totalSize = files.reduce((acc, file) => acc + file.size, 0);

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <Card
                className="p-8 border-2 border-dashed border-slate-300 bg-slate-50 hover:border-indigo-400 transition-colors cursor-pointer text-center"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <FileArchive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-1">
                    {zipFile ? zipFile.name : 'Drop a ZIP file here'}
                </p>
                <p className="text-sm text-slate-500">or click to browse</p>
            </Card>

            {/* Extracting */}
            {extracting && (
                <Card className="p-6 bg-white border border-slate-200 text-center">
                    <div className="animate-pulse">
                        <p className="text-slate-600">Extracting files...</p>
                    </div>
                </Card>
            )}

            {/* Extracted Files */}
            {extracted && files.length > 0 && (
                <>
                    <Card className="p-4 bg-emerald-50 border border-emerald-200">
                        <div className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-2" />
                            <span className="text-emerald-700 font-medium">
                                Extracted {files.length} files ({formatSize(totalSize)})
                            </span>
                        </div>
                    </Card>

                    <Card className="p-4 bg-white border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-slate-900">Extracted Files</h3>
                            <Button onClick={downloadAll} variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" /> Download All
                            </Button>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-auto">
                            {files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100">
                                    <div className="flex items-center flex-1 min-w-0">
                                        <File className="h-4 w-4 text-slate-400 mr-3 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {file.path !== file.name && `${file.path} • `}
                                                {formatSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => downloadFile(file)}
                                        variant="ghost"
                                        size="sm"
                                        className="ml-2"
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}

            {/* Info */}
            <Card className="p-4 bg-blue-50 border border-blue-200">
                <h4 className="font-medium text-blue-800 mb-2">Features</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Extract and preview ZIP contents instantly</li>
                    <li>• Download individual files or all at once</li>
                    <li>• Works entirely in your browser (no upload)</li>
                </ul>
            </Card>
        </div>
    );
}

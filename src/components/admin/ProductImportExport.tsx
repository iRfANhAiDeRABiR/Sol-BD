'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  ChevronDown,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportResult {
  processed: number;
  created: number;
  updated: number;
  skipped: number;
  notices: string[];
}

export default function ProductImportExport({ onImportSuccess }: { onImportSuccess?: () => void }) {
  const router = useRouter();

  // Export menu dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // -------------------------------------------------------------
  // Export Handlers
  // -------------------------------------------------------------
  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const res = await fetch(`/api/admin/products/export?format=${format}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solutionsbd-products-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Products exported as ${format.toUpperCase()} successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = '/api/admin/products/template';
    toast.success('Downloading CSV sample template...');
  };

  // -------------------------------------------------------------
  // Drag & Drop / File Selection
  // -------------------------------------------------------------
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'json') {
      toast.error('Please select a valid .csv or .json file');
      return;
    }
    setSelectedFile(file);
    setImportResult(null);
  };

  // -------------------------------------------------------------
  // Import Execution
  // -------------------------------------------------------------
  const handleStartImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please choose a file to import');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('updateExisting', String(updateExisting));

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult({
        processed: data.processed || 0,
        created: data.created || 0,
        updated: data.updated || 0,
        skipped: data.skipped || 0,
        notices: data.notices || [],
      });

      toast.success(
        `Import completed! Created: ${data.created || 0}, Updated: ${data.updated || 0}`
      );

      // Refresh catalog data
      router.refresh();
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to import products');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2 relative">
      {/* 1. Export Menu Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowExportMenu(!showExportMenu)}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
        >
          {exporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500" />
          ) : (
            <Download className="w-3.5 h-3.5 text-violet-500" />
          )}
          <span>Export</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {showExportMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 space-y-0.5">
            <button
              onClick={() => handleExport('csv')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export as CSV (.csv)</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-violet-500" />
              <span>Export as JSON (.json)</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. Import Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setShowImportModal(true);
          setImportResult(null);
        }}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
      >
        <Upload className="w-3.5 h-3.5 text-indigo-500" />
        <span>Import</span>
      </button>

      {/* 3. Glassmorphic Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in zoom-in-95">
            {/* Close Cross */}
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Upload className="w-5 h-5" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Import Product Catalog
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Upload a <strong>.csv</strong> or <strong>.json</strong> file to batch create or update your digital products and variants.
              </p>
            </div>

            {/* Template Download Banner */}
            <div className="p-3.5 rounded-2xl bg-violet-500/5 dark:bg-violet-500/10 border border-violet-500/20 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-violet-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">
                  Need the standard format?
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 flex-shrink-0"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample Template</span>
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? 'border-violet-500 bg-violet-500/10'
                  : selectedFile
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-white/[0.1] hover:border-violet-400 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-xs mx-auto">
                    {selectedFile.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </div>
                  <span className="text-[10px] text-violet-500 underline block pt-1">
                    Click or drop another file to change
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Drop your .csv or .json file here, or{' '}
                    <span className="text-violet-600 dark:text-violet-400 underline">browse</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Supports RFC-4180 CSV, multi-line descriptions, and variant JSON arrays
                  </div>
                </div>
              )}
            </div>

            {/* Option Checkbox */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={updateExisting}
                  onChange={(e) => setUpdateExisting(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Update existing products if ID or Slug already exists
                </span>
              </label>
            </div>

            {/* Live Result Summary */}
            {importResult && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/[0.06] space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900 dark:text-white">Batch Import Results</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {importResult.processed} Processed
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                    {importResult.created} Created
                  </div>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20">
                    {importResult.updated} Updated
                  </div>
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                    {importResult.skipped} Skipped
                  </div>
                </div>

                {importResult.notices.length > 0 && (
                  <div className="max-h-24 overflow-y-auto space-y-1 text-[10px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-white/[0.04]">
                    {importResult.notices.map((n, i) => (
                      <div key={i} className="flex items-start gap-1 text-amber-600 dark:text-amber-400">
                        <span>•</span>
                        <span>{n}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {importResult ? 'Close' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleStartImport}
                disabled={!selectedFile || importing}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Import...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Start Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useCallback, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, AlertCircle, ScanLine, ArrowUpRight } from 'lucide-react';
import { FileType, UploadedFile } from '../types';

interface ReceiptUploaderProps {
  onFileSelected: (file: UploadedFile) => void;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onFileSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    
    if (file.size > 10 * 1024 * 1024) {
      setError("File size too large. Please upload a file smaller than 10MB.");
      return;
    }

    const fileType = file.type.startsWith('image/') ? FileType.IMAGE : 
                     file.type === 'application/pdf' ? FileType.PDF : null;

    if (!fileType) {
      setError("Unsupported file format. Please upload an image (JPG, PNG) or PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const base64 = result.split(',')[1];
      
      onFileSelected({
        file,
        previewUrl: result,
        type: fileType,
        base64
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelected]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={`relative group overflow-hidden rounded-[2rem] transition-all duration-500 ease-out cursor-pointer border
          ${isDragging 
            ? 'bg-blue-50/50 border-blue-400 shadow-[0_0_40px_rgba(59,130,246,0.2)] scale-[1.02]' 
            : 'bg-white/80 border-white/60 shadow-xl hover:shadow-2xl hover:border-blue-200 hover:-translate-y-1'
          }
        `}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {/* Modern Grid Background */}
        <div className="absolute inset-0 opacity-[0.04]" 
             style={{ 
               backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', 
               backgroundSize: '32px 32px' 
             }}>
        </div>

        <div className="relative z-10 px-12 py-16 flex flex-col items-center text-center">
          <div className="relative mb-8">
            <div className={`
              absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full transition-opacity duration-500
              ${isDragging ? 'opacity-40 scale-150' : ''}
            `}></div>
            <div className={`
              relative w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 border border-white/50 shadow-sm
              ${isDragging ? 'bg-blue-600 rotate-12 scale-110' : 'bg-gradient-to-br from-white to-blue-50 group-hover:scale-105'}
            `}>
              {isDragging ? (
                <ScanLine className="w-10 h-10 text-white animate-pulse" />
              ) : (
                <Upload className="w-10 h-10 text-blue-600 group-hover:-translate-y-1 transition-transform duration-300" />
              )}
            </div>
            
            {/* Decorative Icon Badge */}
            <div className="absolute -right-2 -bottom-2 bg-white rounded-full p-2 shadow-lg border border-gray-100">
               <ArrowUpRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">
            Upload Receipt
          </h3>
          <p className="text-gray-500 mb-8 max-w-[280px] leading-relaxed font-medium">
            Drag & drop your messy receipt, invoice, or bill. 
            <br/><span className="text-blue-600 font-semibold">We'll clean it up.</span>
          </p>

          <div className="flex gap-3">
            <span className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm text-xs font-semibold text-gray-600 flex items-center gap-2 border border-gray-200/50 shadow-sm group-hover:border-blue-100 transition-colors">
              <ImageIcon className="w-4 h-4 text-blue-500" /> Images
            </span>
            <span className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-sm text-xs font-semibold text-gray-600 flex items-center gap-2 border border-gray-200/50 shadow-sm group-hover:border-blue-100 transition-colors">
              <FileText className="w-4 h-4 text-red-500" /> PDF
            </span>
          </div>
        </div>

        <input
          id="file-input"
          type="file"
          className="hidden"
          accept="image/*,application/pdf"
          onChange={handleFileInput}
        />
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl flex items-start gap-4 text-red-700 animate-fade-in-up shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Upload Failed</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};
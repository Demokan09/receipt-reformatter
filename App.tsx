import React, { useState, useEffect } from 'react';
import { UploadedFile, ReceiptData, ProcessingState } from './types';
import { ReceiptUploader } from './components/ReceiptUploader';
import { ReceiptViewer } from './components/ReceiptViewer';
import { processReceiptWithGemini } from './services/geminiService';
import { Sparkles, Scan, Loader2, CheckCircle2, FileText, LayoutTemplate, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [data, setData] = useState<ReceiptData | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({ status: 'idle' });
  const [loadingStep, setLoadingStep] = useState(0);

  // Enhanced loading steps
  const loadingMessages = [
    { text: "Enhancing image clarity...", icon: Scan },
    { text: "Reading structural layout...", icon: LayoutTemplate },
    { text: "Extracting client & merchant info...", icon: FileText },
    { text: "Verifying service dates & totals...", icon: ShieldCheck },
    { text: "Formatting digital record...", icon: Sparkles }
  ];

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (processing.status === 'analyzing') {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [processing.status]);

  const handleFileSelected = async (uploadedFile: UploadedFile) => {
    setFile(uploadedFile);
    setProcessing({ status: 'analyzing', message: 'Starting analysis...' });
    
    try {
      const result = await processReceiptWithGemini(uploadedFile.base64, uploadedFile.file.type);
      setData(result);
      setProcessing({ status: 'complete' });
    } catch (error) {
      setProcessing({ 
        status: 'error', 
        message: error instanceof Error ? error.message : "Something went wrong during processing." 
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setData(null);
    setProcessing({ status: 'idle' });
  };

  return (
    <div className="min-h-screen font-sans selection:bg-indigo-100 text-slate-800">
      {/* Navigation - Hide on Print */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/60 backdrop-blur-xl border-b border-white/40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="block text-sm font-bold text-slate-900 leading-none">Receipt</span>
              <span className="block text-sm font-light text-slate-500 leading-none">Reform AI</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-50/50 rounded-full border border-indigo-100/50">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700">Gemini 2.5 Flash</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12 no-print">
        {!file && (
          <div className="flex flex-col items-center justify-center min-h-[65vh] animate-fade-in-up">
            <div className="text-center mb-16 max-w-2xl px-4">
              <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                Turn messy paper into <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                  perfect digital records.
                </span>
              </h1>
              <p className="text-lg text-slate-500 mb-8 leading-relaxed font-light">
                Advanced AI that extracts client names, passport numbers, and line items from any receipt or invoice.
              </p>
            </div>
            <ReceiptUploader onFileSelected={handleFileSelected} />
          </div>
        )}

        {file && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[calc(100vh-160px)] min-h-[600px] animate-fade-in-up">
            {/* Left Column: Original Source */}
            <div className="flex flex-col h-full bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl overflow-hidden ring-1 ring-white/60">
              <div className="p-5 border-b border-white/20 flex justify-between items-center bg-white/20">
                <h3 className="font-bold text-xs uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Scan className="w-4 h-4" /> Original Document
                </h3>
              </div>
              
              <div className="flex-1 relative overflow-hidden bg-slate-100/50 flex items-center justify-center p-8 group">
                 {/* Background pattern */}
                 <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
                 
                 <div className="relative z-10 max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden transition-transform duration-700 hover:scale-[1.02] ring-1 ring-black/5">
                   {processing.status === 'analyzing' && (
                     <div className="absolute inset-0 z-20 bg-indigo-900/10 pointer-events-none overflow-hidden rounded-lg">
                       <div className="w-full h-1.5 bg-indigo-400/90 shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-scan"></div>
                     </div>
                   )}
                   
                   {file.type === 'image' ? (
                     <img 
                      src={file.previewUrl} 
                      alt="Receipt Original" 
                      className="max-h-[60vh] object-contain bg-white" 
                     />
                   ) : (
                      <div className="w-64 h-80 bg-white flex flex-col items-center justify-center rounded-lg shadow-sm">
                        <FileText className="w-12 h-12 text-slate-300 mb-4" />
                        <span className="font-medium text-slate-500">PDF Document</span>
                      </div>
                   )}
                 </div>
              </div>
            </div>

            {/* Right Column: Processing or Result */}
            <div className="relative h-full">
              {processing.status === 'analyzing' && (
                <div className="h-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl p-8 ring-1 ring-white/60">
                  <div className="w-full max-w-sm">
                    <div className="flex justify-center mb-10">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse-slow"></div>
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-indigo-50 relative z-10">
                          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6 relative">
                      {/* Vertical line connector */}
                      <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100 -z-10"></div>
                      
                      {loadingMessages.map((step, idx) => {
                        const Icon = step.icon;
                        const isActive = idx === loadingStep;
                        const isCompleted = idx < loadingStep;
                        
                        return (
                          <div 
                            key={idx}
                            className={`flex items-center gap-4 transition-all duration-500 ${
                              idx <= loadingStep + 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 z-10 ${
                              isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' : 
                              isActive ? 'bg-white border-indigo-600 text-indigo-600 shadow-md scale-110' : 'bg-white border-gray-200 text-gray-300'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold transition-colors duration-300 ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.text}
                              </p>
                              {isActive && <p className="text-xs text-indigo-500 font-medium animate-pulse">Processing...</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {processing.status === 'error' && (
                <div className="h-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-md rounded-[2rem] border border-red-100 shadow-xl p-8 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-red-50/50">
                    <Scan className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Processing Failed</h3>
                  <p className="text-slate-600 mb-8 max-w-xs mx-auto leading-relaxed">{processing.message}</p>
                  <button 
                    onClick={handleReset}
                    className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all hover:scale-105 shadow-xl shadow-slate-900/20"
                  >
                    Try Another Document
                  </button>
                </div>
              )}

              {data && processing.status === 'complete' && (
                <ReceiptViewer data={data} onReset={handleReset} />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
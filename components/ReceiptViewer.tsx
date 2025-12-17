import React, { useState, useRef } from 'react';
import { ReceiptData } from '../types';
import { Check, Copy, Calendar, MapPin, User, FileCheck, RefreshCw, Printer, Tag, Cake, ImagePlus, AlertCircle, Loader2, Building2, Pencil, Activity } from 'lucide-react';

interface ReceiptViewerProps {
  data: ReceiptData;
  onReset: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ data, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);


  // CONSTANTS
  const ISSUING_COMPANY = "MEDLIFE ASSISTANCE";

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  const handlePrintPDF = () => {
    setIsPrinting(true);

    // 1. Get the content
    const receiptContent = document.querySelector('.receipt-container');
    if (!receiptContent) {
      alert("Could not find receipt content.");
      setIsPrinting(false);
      return;
    }

    // 2. Open a new window
    const printWindow = window.open('', '_blank', 'width=900,height=1200,menubar=no,toolbar=no,location=no,status=no,titlebar=no');

    if (!printWindow) {
      alert("Pop-up blocked! Please allow pop-ups for this site to download the PDF.");
      setIsPrinting(false);
      return;
    }

    // 3. Construct the HTML document
    // Clean up contentEditable attributes for the PDF output so it looks static
    let contentHTML = receiptContent.innerHTML;
    contentHTML = contentHTML.replace(/contenteditable="true"/gi, '');

    const fullHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice #${data.invoiceNumber || 'Generated'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <script>
          tailwind.config = {
            theme: {
              extend: {
                fontFamily: {
                  sans: ['Inter', 'sans-serif'],
                  mono: ['JetBrains Mono', 'monospace'],
                },
                colors: {
                  slate: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }
                }
              }
            }
          }
        </script>
        <style>
          /* Normalize page */
          @page { 
            margin: 0;
            size: auto; 
          }
          
          body { 
            background: white; 
            font-family: 'Inter', sans-serif;
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
            font-size: 12px; /* Base font size reduction for print */
          }
          
          /* The main container acts as the page */
          .receipt-container {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            
            /* Critical: Override the screen min-height to allow auto-sizing */
            min-height: auto !important; 
            height: auto !important;
            
            /* Prevent unwanted breaks */
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Hide elements that shouldn't appear in print/pdf */
          .no-print { display: none !important; }

          /* COMPACT PRINT LAYOUT OVERRIDES */
          @media print {
            /* General Layout */
            body { padding: 0; transform-origin: top left; }
            /* Force fit on one page if possible by slightly scaling down the whole container if needed, 
               but primarily relying on tighter spacing first */
            .receipt-container { 
               padding: 20px 25px !important; 
               max-width: 100% !important;
               width: 100% !important;
            }
            
            /* Header Compactness */
            h1 { font-size: 18px !important; margin-bottom: 2px !important; line-height: 1 !important; } /* Merchant Name */
            .w-20.h-20 { width: 45px !important; height: 45px !important; } /* Logo Size */
            .text-3xl { font-size: 16px !important; } /* Invoice Number / Large text */
            
            /* Spacing Reduction - Aggressive */
            .p-10 { padding: 15px !important; }
            .pb-6 { padding-bottom: 5px !important; }
            .mb-12 { margin-bottom: 10px !important; }
            .mb-10 { margin-bottom: 8px !important; }
            .gap-12 { gap: 15px !important; }
            .gap-5 { gap: 10px !important; }
            .pt-8 { padding-top: 10px !important; }
            
            /* Headers reduction */
            h4, .uppercase.tracking-widest { 
              font-size: 9px !important; 
              margin-bottom: 4px !important; 
              letter-spacing: 0.05em !important;
            }
            
            /* Text Sizing */
            .text-base { font-size: 10px !important; line-height: 1.2 !important; }
            .text-sm { font-size: 10px !important; line-height: 1.2 !important; }
            .text-xs { font-size: 9px !important; line-height: 1.1 !important; }
            
            /* Table Compactness */
            th { 
              padding-top: 4px !important; 
              padding-bottom: 4px !important; 
              font-size: 9px !important; 
              border-bottom-width: 1px !important;
            }
            td { 
              padding-top: 2px !important; 
              padding-bottom: 2px !important; 
              font-size: 10px !important; 
            }
            .border-b-2 { border-bottom-width: 1px !important; }
            
            /* Address Grid layout adjustment for print */
            .grid-cols-2 {
               gap: 20px !important;
            }
            
            /* Service Date Box redundancy removal */
            .bg-slate-50 { background-color: transparent !important; border: none !important; padding: 0 !important; }
            
            /* Financial Summary Compactness */
            .w-72 { width: 200px !important; }
            .space-y-3 > * + * { margin-top: 2px !important; }
            .pt-10 { padding-top: 10px !important; }
            .pb-10 { padding-bottom: 0px !important; }
            
            /* Specific height adjustments */
            .h-2 { height: 4px !important; } /* Top bar */
            .my-auto { margin-top: 2px !important; margin-bottom: 2px !important; }
            
            /* Footer Removal / Minimization */
            .border-t { border-top-width: 1px !important; padding-top: 5px !important; margin-top: 5px !important; }
            
            /* Hide unnecessary visual fluff */
            .rounded-lg, .rounded-sm, .rounded-md { border-radius: 0 !important; }
            .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: none !important; }

            /* Ensure colors are preserved */
            * { 
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* .text-slate-400, .text-slate-500, .text-slate-600 { color: #333 !important; } */
            /* .text-red-600 { color: black !important; } */
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          ${contentHTML}
        </div>
        <script>
          // Auto-print when loaded
          window.onload = function() {
            // Slight delay to ensure fonts/tailwind render
            setTimeout(function() {
              window.focus();
              window.print();
            }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    // 4. Write to the new window
    printWindow.document.open();
    printWindow.document.write(fullHTML);
    printWindow.document.close();

    // Reset state
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };





  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Actions Toolbar - Hidden on Print */}
      <div className="no-print flex flex-wrap gap-2 justify-between items-center mb-6 p-2 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-sm">
        <div className="px-4 flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${data.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-500'} shadow-[0_0_10px_rgba(16,185,129,0.4)]`}></div>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {data.confidence > 0.8 ? 'Verified' : 'Review Needed'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 hover:text-gray-900 hover:bg-white rounded-xl transition-all active:scale-95"
            title="Copy JSON to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'JSON'}</span>
          </button>

          <div className="w-px h-5 bg-gray-300/50 my-auto mx-1"></div>

          <button
            onClick={handlePrintPDF}
            disabled={isPrinting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wide text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 rounded-xl transition-all shadow-lg shadow-slate-900/10 active:scale-95 disabled:cursor-wait"
          >
            {isPrinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            <span>{isPrinting ? 'Opening Print View...' : 'Download / Print'}</span>
          </button>

          <button
            onClick={onReset}
            className="ml-2 flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
            title="Start New Scan"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Professional Invoice Card */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center pb-12 pt-2 px-2">
        <div
          className="receipt-container w-full max-w-4xl bg-white relative transition-transform duration-300 shadow-2xl rounded-sm overflow-hidden"
          style={{ minHeight: '800px' }}
        >
          {/* Top Color Bar */}
          <div className="h-2 w-full bg-slate-900"></div>

          {/* Invoice Header */}
          <div className="p-10 pb-6">
            <div className="flex justify-between items-start mb-24">
              <div className="flex gap-5 items-start">
                {/* Logo Upload Section - Expanded */}
                {/* Fixed Logo Section */}
                <div className="flex flex-col items-center select-none cursor-default py-2 pr-4">
                  <div className="flex items-center tracking-tight">
                    <span
                      className="text-[#D4AF37] font-black italic text-5xl mr-0.5 print:text-[#D4AF37]"
                      style={{
                        fontFamily: 'Inter, sans-serif',
                        printColorAdjust: 'exact',
                        WebkitPrintColorAdjust: 'exact'
                      }}
                    >
                      MED
                    </span>
                    <span className="text-slate-900 font-bold text-5xl">Life</span>
                    <Activity className="w-10 h-10 text-slate-900 ml-1.5 stroke-[3]" />
                  </div>
                  <span className="text-slate-400 font-bold text-[11px] tracking-[0.35em] uppercase w-full text-center -mt-1 pl-1">
                    ASSISTANCE
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Receipt / Invoice</p>
                <div className="flex items-center justify-end gap-2 group/edit cursor-text relative">
                  <span className="text-3xl font-mono font-bold text-slate-900 tracking-tight">#</span>
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    className="text-3xl font-mono font-bold text-slate-900 tracking-tight outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 transition-colors min-w-[60px] text-right"
                    title="Click to edit invoice number"
                  >
                    {data.invoiceNumber || data.date.replace(/-/g, '').slice(2)}
                  </span>
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/edit:opacity-100 transition-opacity no-print">
                    <Pencil className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 text-slate-500 mt-2 font-medium">
                  <Calendar className="w-4 h-4" />
                  <span>{data.date}</span>
                </div>
              </div>
            </div>

            {/* Addresses Grid */}
            <div className="grid grid-cols-2 gap-12 mb-12 border-t border-slate-100 pt-8">
              {/* Service Provider Column */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                  Service Provider
                </h4>
                <div className="space-y-3 text-sm">
                  <p className="font-bold text-slate-900 text-base">{data.merchantName}</p>
                  {data.merchantAddress && (
                    <div className="flex items-start gap-3 text-slate-500">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{data.merchantAddress}</span>
                    </div>
                  )}
                  {data.merchantPhone && (
                    <p className="text-slate-500 ml-7">
                      {data.merchantPhone}
                    </p>
                  )}
                </div>
              </div>

              {/* Billed To Client Column */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">
                  Billed To / Client
                </h4>
                {data.clientName ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <User className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 text-base">{data.clientName}</p>
                        {data.clientCountry && (
                          <p className="text-slate-500 uppercase text-xs font-semibold mt-0.5 tracking-wide">
                            {data.clientCountry}
                          </p>
                        )}
                      </div>
                    </div>

                    {data.clientBirthDate && (
                      <div className="flex items-center gap-3 text-slate-600 ml-1">
                        <Cake className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-medium text-xs">
                          <span className="text-slate-400 mr-2 uppercase text-[10px] font-bold">DOB:</span>
                          {data.clientBirthDate}
                        </span>
                      </div>
                    )}

                    {data.clientPassport && (
                      <div className="flex items-center gap-3 text-slate-600 mt-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ID</span>
                        <span className="font-mono font-medium bg-slate-50 px-2 py-1 rounded border border-slate-100">
                          {data.clientPassport}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 italic flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Client details not detected
                  </div>
                )}
              </div>
            </div>

            {/* Service Date if separate */}
            {data.serviceDate && (
              <div className="mb-10 p-4 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Service / Admission Date</span>
                <span className="font-mono font-bold text-slate-900">{data.serviceDate}</span>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="px-10 pb-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-4 text-sm font-bold text-slate-900 w-1/2">Description</th>
                  <th className="py-4 text-sm font-bold text-slate-900 text-center">Quantity</th>
                  <th className="py-4 text-sm font-bold text-slate-900 text-right">Unit Price</th>
                  <th className="py-4 text-sm font-bold text-slate-900 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item, index) => (
                  <tr key={index} className="text-sm">
                    <td className="py-4 pr-4 font-medium text-slate-700 text-base">{item.description}</td>
                    <td className="py-4 text-center text-slate-500 font-mono">{item.quantity}</td>
                    <td className="py-4 text-right text-slate-500 font-mono">
                      {formatCurrency(item.unitPrice, data.currency)}
                    </td>
                    <td className="py-4 text-right font-bold text-slate-900 font-mono text-base">
                      {formatCurrency(item.totalPrice, data.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section (Right-aligned, immediately after table) */}
          <div className="px-10 pt-2 pb-6 flex justify-end">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-slate-500 text-sm">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(data.subtotal, data.currency)}</span>
              </div>

              {data.discount && data.discount > 0 && (
                <div className="flex justify-between text-red-600 bg-red-50 px-3 py-1.5 rounded-md text-sm font-bold border border-red-100">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" /> Discount
                  </span>
                  <span className="font-mono">-{formatCurrency(data.discount, data.currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-sm">
                <span>Tax</span>
                <span className="font-mono">{formatCurrency(data.tax, data.currency)}</span>
              </div>

              <div className="border-t-2 border-slate-900 pt-4 mt-4 flex justify-between items-end">
                <span className="text-sm font-bold text-slate-900 uppercase tracking-wider">Total Due</span>
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  {formatCurrency(data.total, data.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Instructions (Left-aligned, below Totals, with spacing) */}
          <div className="px-10 pt-6 pb-10">
            {data.bankDetails && (data.bankDetails.iban || data.bankDetails.accountNumber) && (
              <div className="bg-slate-50 rounded-lg p-5 border border-slate-100 text-sm space-y-2 max-w-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <h4 className="font-bold text-slate-700 uppercase tracking-wider text-xs">Payment Instructions</h4>
                </div>
                {data.bankDetails.accountName && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Beneficiary</span>
                    <span className="font-medium text-slate-900">{data.bankDetails.accountName}</span>
                  </div>
                )}
                {data.bankDetails.bankName && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Bank Name</span>
                    <span className="font-medium text-slate-900">{data.bankDetails.bankName}</span>
                  </div>
                )}
                {data.bankDetails.location && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Location / Branch</span>
                    <span className="font-medium text-slate-900">{data.bankDetails.location}</span>
                  </div>
                )}
                {data.bankDetails.iban && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">IBAN</span>
                    <span className="font-mono text-slate-700">{data.bankDetails.iban}</span>
                  </div>
                )}
                {!data.bankDetails.iban && data.bankDetails.accountNumber && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Account No</span>
                    <span className="font-mono text-slate-700">{data.bankDetails.accountNumber}</span>
                  </div>
                )}
                {data.bankDetails.swift && (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">SWIFT / BIC</span>
                    <span className="font-mono text-slate-700">{data.bankDetails.swift}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Digital Signature Section - Aligned with Totals */}
          <div className="px-10 pb-12 flex justify-end">
            <div className="w-72 flex flex-col items-center">
              <div className="w-full relative px-6 mb-1">
                <img
                  src="/assets/medlife-stamp-transparent.png"
                  alt="MEDLIFE Official Stamp"
                  className="w-full object-contain opacity-90 rotate-[-2deg] mix-blend-multiply scale-110 contrast-125 brightness-110"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0 z-10 relative">Authorized Signature & Stamp</span>
            </div>
          </div>

          {/* Footer - Hidden on Print */}
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between no-print">
            <div className="flex items-center gap-2 text-slate-400">
              <FileCheck className="w-4 h-4" />
              <span className="text-xs font-medium">Digitally extracted via Gemini AI</span>
            </div>
            {data.summary && (
              <p className="text-xs text-slate-400 italic max-w-md text-right line-clamp-1">
                "{data.summary}"
              </p>
            )}
            <div className="flex items-center gap-1 opacity-30">
              <span className="text-[10px] font-bold text-slate-900">Gemini</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useRef } from 'react';
import { ReceiptData } from '../types';
import { Check, Copy, Calendar, MapPin, User, FileCheck, RefreshCw, Printer, Tag, Cake, ImagePlus, AlertCircle, Loader2, Building2, Pencil, Activity } from 'lucide-react';

interface ReceiptViewerProps {
  data: ReceiptData;
  onReset: () => void;
  onDateChange: (newDate: string) => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({ data, onReset, onDateChange }) => {
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
    // CLONE the content first so we can modify it for print without affecting the live view
    const clonedContent = receiptContent.cloneNode(true) as HTMLElement;

    // Fix inputs: explicitly set the 'value' attribute so it appears in innerHTML
    const inputs = clonedContent.querySelectorAll('input');
    const originalInputs = receiptContent.querySelectorAll('input');

    inputs.forEach((input, index) => {
      // Transfer current value from the live input to the cloned input's attribute
      input.setAttribute('value', originalInputs[index].value);
    });

    let contentHTML = clonedContent.innerHTML;
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





  const getInputValue = (dateString: string) => {
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      return '';
    } catch {
      return '';
    }
  };

  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateChange(e.target.value);
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

          {/* Logo & Date Header */}
          <div className="flex justify-between items-start px-8 pt-8 pb-4">
            {/* Logo - Top Left */}
            <div className="flex flex-col items-center select-none cursor-default">
              <div className="flex items-center tracking-tight transform scale-90 origin-left">
                <span
                  className="text-[#D4AF37] font-black italic text-5xl mr-0.5"
                  style={{ fontFamily: 'Inter, sans-serif' }}
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

            {/* Editable Date - Top Right */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</span>
              <div className="group/edit relative flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <div className="relative">
                  <input
                    type="date"
                    value={getInputValue(data.date)}
                    onChange={handleDateInput}
                    className="text-right font-mono font-bold text-slate-900 bg-transparent outline-none border-b border-transparent hover:border-slate-200 focus:border-indigo-500 transition-colors w-[140px] appearance-none [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-80 p-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Medical Report Header */}
          <div className="p-8 pb-4">
            <div className="border-b-2 border-slate-900 mb-6 pb-2 text-center">
              <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">MEDICAL REPORT</h1>
            </div>

            <div className="flex flex-col gap-1 text-xs text-slate-900 font-bold tracking-tight">
              {/* Row 1: Name & Our Ref */}
              <div className="flex justify-between items-baseline min-h-[1.25rem]">
                <div className="flex gap-2">
                  <span className="w-32 shrink-0 uppercase text-slate-900">NAME&SURNAME:</span>
                  <span className="font-medium text-slate-900 truncate">{data.clientName || '______________________'}</span>
                </div>
                {/* Strictly aligned right column */}
                <div className="grid grid-cols-[160px_180px] gap-3">
                  <span className="uppercase text-right text-slate-900">OUR REF. NO :</span>
                  <span className="font-medium font-mono text-right text-slate-900">{data.medicalDetails?.ourRefNo || ''}</span>
                </div>
              </div>

              {/* Row 2: DOB & Your Ref */}
              <div className="flex justify-between items-baseline min-h-[1.25rem]">
                <div className="flex gap-2">
                  <span className="w-32 shrink-0 uppercase text-slate-900">DATE OF BIRTH :</span>
                  <span className="font-medium text-slate-900">{data.clientBirthDate || ''}</span>
                </div>
                <div className="grid grid-cols-[160px_180px] gap-3">
                  <span className="uppercase text-right text-slate-900">YOUR REF. NO :</span>
                  <span className="font-medium font-mono text-right text-slate-900">{data.medicalDetails?.yourRefNo || ''}</span>
                </div>
              </div>

              {/* Row 3: Address & Hotel/Room */}
              <div className="flex justify-between items-baseline min-h-[1.25rem]">
                <div className="flex gap-2">
                  <span className="w-32 shrink-0 uppercase text-slate-900">HOME ADDRESS :</span>
                  <span className="font-medium text-left text-slate-900">{data.clientCountry || ''}</span>
                </div>
                {/* Hotel Row - Special Case: Hotel aligned with other labels, Room in value space */}
                <div className="grid grid-cols-[160px_180px] gap-3">
                  <span className="uppercase text-right text-slate-900">HOTEL :</span>
                  <div className="flex justify-end gap-3 font-medium text-slate-900">
                    <span className="truncate max-w-[80px]">{data.medicalDetails?.hotel || ''}</span>
                    <div className="flex gap-1 shrink-0">
                      <span className="uppercase">ROOM NO :</span>
                      <span className="font-mono">{data.medicalDetails?.roomNo || ''}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 4: Insurance & Patient Phone */}
              <div className="flex justify-between items-baseline mt-4 min-h-[1.25rem]">
                <div className="flex gap-2">
                  <span className="w-32 shrink-0 uppercase text-slate-900">INSURANCE :</span>
                  <span className="font-medium text-slate-900">{data.medicalDetails?.insurance || ''}</span>
                </div>
                <div className="grid grid-cols-[160px_180px] gap-3">
                  <span className="uppercase text-right text-slate-900">PATIENT'S PHONE :</span>
                  <span className="font-medium font-mono text-right text-slate-900">{data.medicalDetails?.patientPhone || ''}</span>
                </div>
              </div>

              {/* Row 5: Travel Dates & Policy */}
              <div className="flex justify-between items-baseline min-h-[1.25rem]">
                <div className="flex gap-2">
                  <span className="w-32 shrink-0 uppercase text-slate-900">TRAVEL DATES :</span>
                  <span className="font-medium text-slate-900">{data.medicalDetails?.travelDates || '/'}</span>
                </div>
                <div className="grid grid-cols-[160px_180px] gap-3">
                  <span className="uppercase text-right text-slate-900">POLICY NUMBER :</span>
                  <span className="font-medium font-mono text-right text-slate-900">{data.medicalDetails?.policyNumber || ''}</span>
                </div>
              </div>

              {/* Row 6: Admission Date */}
              <div className="flex justify-end mt-1 min-h-[1.25rem]">
                <div className="grid grid-cols-[160px_180px] gap-3">
                  <span className="uppercase text-right text-slate-900">ADMISION DATE / HOUR :</span>
                  <span className="font-medium font-mono text-right text-slate-900">{data.medicalDetails?.admissionDate || data.serviceDate || ''}</span>
                </div>
              </div>

              {/* Row 7: Discharge Date */}
              <div className="flex justify-end min-h-[1.25rem]">
                <div className="grid grid-cols-[160px_180px] gap-3">
                  <span className="uppercase text-right text-slate-900">DISCHARGED DATE / HOUR :</span>
                  <span className="font-medium font-mono text-right text-slate-900">{data.medicalDetails?.dischargeDate || ''}</span>
                </div>
              </div>
            </div>

            {/* Divider Line */}
            <div className="border-b-2 border-slate-900 mt-4 mb-4"></div>
          </div>

          {/* Medical Report Body */}
          {(data.medicalDetails?.diagnosis || data.medicalDetails?.history) && (
            <div className="px-10 pb-8 mb-4 border-b-4 border-double border-slate-100">
              <div className="grid grid-cols-1 gap-6">
                {data.medicalDetails.diagnosis && (
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">DIAGNOSIS</h4>
                    <p className="text-sm font-medium text-slate-700 uppercase leading-relaxed">{data.medicalDetails.diagnosis}</p>
                  </div>
                )}
                {data.medicalDetails.complaint && (
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">COMPLAINT</h4>
                    <p className="text-sm text-slate-600 leading-relaxed uppercase">{data.medicalDetails.complaint}</p>
                  </div>
                )}
                {data.medicalDetails.history && (
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">HISTORY</h4>
                    <p className="text-sm text-slate-600 leading-relaxed uppercase text-justify">{data.medicalDetails.history}</p>
                  </div>
                )}
                {data.medicalDetails.physicalExamination && (
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">PHYSICAL EXAMINATION</h4>
                    <p className="text-sm text-slate-600 leading-relaxed uppercase text-justify">{data.medicalDetails.physicalExamination}</p>
                  </div>
                )}
                {data.medicalDetails.treatment && (
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">TREATMENT</h4>
                    <p className="text-sm text-slate-600 leading-relaxed uppercase">{data.medicalDetails.treatment}</p>
                  </div>
                )}
                {data.medicalDetails.prognosis && (
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 mb-1">PROGNOSIS</h4>
                    <p className="text-sm text-slate-600 leading-relaxed uppercase">{data.medicalDetails.prognosis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

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
            {/* Hardcoded Payment Instructions */}
            <div className="mt-6 text-[10px] leading-[1.3] text-[#002855] font-sans tracking-tight">
              <div className="font-black uppercase mb-0.5 tracking-tight text-[11px]">
                QNB FINANSBANK - TURKEY <span className="ml-2">SWIFT CODE: FNNBTRISKUS</span>
              </div>
              <div className="italic font-medium">
                <div>
                  <span className="inline-block w-[65px]">EURO IBAN :</span>
                  <span className="font-sans not-italic">TR93 0011 1000 0000 0014 3159 37</span>
                </div>
                <div>
                  <span className="inline-block w-[65px]">USD IBAN &nbsp;:</span>
                  <span className="font-sans not-italic">TR82 0011 1000 0000 0014 3159 41</span>
                </div>
              </div>

              <div className="mt-1 flex items-start">
                <span className="font-black w-[42px] shrink-0">Adres:</span>
                <span className="font-medium">Türkmen Mah. Mehmet Sargın Sk. No:2A KUŞADASI - TÜRKİYE</span>
              </div>

              <div className="flex items-start">
                <span className="font-black w-[42px] shrink-0">Tel &nbsp;&nbsp;&nbsp;:</span>
                <span className="font-medium">+9 (0.256) 614 33 33 - Fax: +9 (0.256) 612 44 99</span>
              </div>

              <div className="font-medium mt-0.5">
                info@medlifeassistance.com · Kuşadası V.D. H. No: 613 052 9361
              </div>
            </div>
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
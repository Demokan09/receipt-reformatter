export interface ReceiptItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BankDetails {
  bankName: string | null;
  location: string | null;
  accountName: string | null;
  accountNumber: string | null;
  iban: string | null;
  swift: string | null;
}

export interface MedicalDetails {
  ourRefNo: string | null;
  yourRefNo: string | null;
  hotel: string | null;
  roomNo: string | null;
  patientPhone: string | null;
  insurance: string | null;
  policyNumber: string | null;
  admissionDate: string | null;
  dischargeDate: string | null;
  travelDates: string | null;
  diagnosis: string | null;
  complaint: string | null;
  history: string | null;
  physicalExamination: string | null;
  treatment: string | null;
  prognosis: string | null;
}

export interface ReceiptData {
  // Merchant / Provider Details
  merchantName: string;
  merchantAddress: string | null;
  merchantPhone: string | null;

  // Transaction Details
  date: string;
  time: string | null;
  invoiceNumber: string | null;

  // Client / Customer Details
  clientName: string | null;
  clientPassport: string | null;
  clientCountry: string | null;
  clientBirthDate: string | null;
  serviceDate: string | null;

  // Financials
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number | null;
  tip: number | null;
  total: number;
  currency: string;

  // Payment Details
  bankDetails: BankDetails | null;

  // Medical Details
  medicalDetails: MedicalDetails | null;

  // Meta
  category: string;
  confidence: number;
  summary: string | null;
}

export interface ProcessingState {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  message?: string;
}

export enum FileType {
  IMAGE = 'image',
  PDF = 'pdf'
}

export interface UploadedFile {
  file: File;
  previewUrl: string;
  type: FileType;
  base64: string;
}
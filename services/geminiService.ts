import { GoogleGenAI, Type } from "@google/genai";
import { ReceiptData } from "../types";

export const processReceiptWithGemini = async (
  base64Data: string,
  mimeType: string
): Promise<ReceiptData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey });

  const modelId = "gemini-2.5-flash";

  const prompt = `
    You are an expert document digitization AI. Extract data from this receipt/invoice with high precision.
    
    CRITICAL EXTRACTION RULES:
    
    1. **LINE ITEMS (No Math Assumptions)**:
       - Extract 'unitPrice' and 'totalPrice' EXACTLY as printed on the paper. 
       - **Do not calculate** one from the other. If the paper says Unit 150 and Total 300, extract Unit 150 and Total 300.
       - **Medical Receipts**: Be very careful. If there is "Patient Share" and "Total Amount", the 'totalPrice' of the item is the "Total Amount" (Gross Charge). Do not put the patient share as the item price.
       - If Quantity is missing, infer it (e.g., Total/Unit), but prioritize the printed numbers for prices.

    2. **DISCOUNTS & DEDUCTIONS**:
       - Scan specifically for "Discount", "Reduction", "Insurance Adjustment", "Co-Pay", or "Rebate". 
       - These often appear in the summary section or as negative line items. 
       - Extract the absolute value into the root 'discount' field.

    3. **CLIENT DETAILS**:
       - Look for "Guest Name", "Patient Name", "Passport No", "ID Number", "Nationality", "Service Date", "Admission Date".
       - **Date of Birth**: Look for "DOB", "Birth Date", "Born", or dates near the patient name.
       - This is crucial for professional invoices.
       
    4. **PAYMENT / BANK DETAILS**:
       - Look for "Bank Name", "Location", "Branch", "IBAN", "SWIFT", "BIC", "Account No", "Beneficiary", "Wire Transfer Info".
       - Extract specific "Location" or address fields for the bank (e.g., "KUSADASI-AYDIN").
       - These are often found at the bottom of invoices. Extract them into the 'bankDetails' object.

    Output strictly valid JSON matching the schema.
    - Currency: ISO 4217 code.
    - Date: YYYY-MM-DD.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: { type: Type.STRING },
            merchantAddress: { type: Type.STRING, nullable: true },
            merchantPhone: { type: Type.STRING, nullable: true },
            
            date: { type: Type.STRING },
            time: { type: Type.STRING, nullable: true },
            invoiceNumber: { type: Type.STRING, nullable: true },
            
            clientName: { type: Type.STRING, nullable: true },
            clientPassport: { type: Type.STRING, nullable: true },
            clientCountry: { type: Type.STRING, nullable: true },
            clientBirthDate: { type: Type.STRING, nullable: true },
            serviceDate: { type: Type.STRING, nullable: true },

            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unitPrice: { type: Type.NUMBER },
                  totalPrice: { type: Type.NUMBER },
                },
                required: ["description", "quantity", "unitPrice", "totalPrice"],
              },
            },
            subtotal: { type: Type.NUMBER },
            tax: { type: Type.NUMBER },
            discount: { type: Type.NUMBER, nullable: true },
            tip: { type: Type.NUMBER, nullable: true },
            total: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            
            bankDetails: {
              type: Type.OBJECT,
              nullable: true,
              properties: {
                bankName: { type: Type.STRING, nullable: true },
                location: { type: Type.STRING, nullable: true },
                accountName: { type: Type.STRING, nullable: true },
                accountNumber: { type: Type.STRING, nullable: true },
                iban: { type: Type.STRING, nullable: true },
                swift: { type: Type.STRING, nullable: true },
              }
            },

            category: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING, nullable: true }
          },
          required: [
            "merchantName",
            "date",
            "items",
            "total",
            "currency",
            "category",
            "subtotal",
            "tax",
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(text) as ReceiptData;
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to process receipt. Please try again.");
  }
};
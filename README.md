# Receipt Reformatter AI 🧾✨

> Turn messy paper receipts into perfect, single-page digital records using Google's Gemini AI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Gemini](https://img.shields.io/badge/AI-Gemini%202.0%20Flash-8e44ad.svg)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg)

**Receipt Reformatter AI** is a powerful web application that uses advanced multimodal AI to instantly extract structured data from photos of receipts, invoices, and medical bills. It reformats them into a clean, professional, and standardized PDF layout that fits perfectly on a single page—ideal for expense reports, insurance claims, and tax documentation.

## 🚀 Features

-   **🤖 Multimodal AI Extraction:** Powered by Google's **Gemini 2.0 Flash**, it accurately identifies merchant details, line items, taxes, and totals from even the blurriest photos.
-   **📄 Perfect PDF Export:** Automatically generates a professional, single-page PDF receipt, no matter how many line items are included.
-   **🏥 Medical & Insurance Ready:** specialized fields for doctor names, insurance codes, and patient IDs.
-   **🌍 Multi-Currency & Language:** Intelligently detects and formats currencies and supports varied receipt languages.
-   **🔒 Privacy First:** Your data is processed via secure API calls; customizable "Client" fields allow for easy anonymization or corrections.
-   **⚡ Blazing Fast:** Built with Vite and React for instant feedback and a smooth UI.

## 🛠️ Tech Stack

-   **Frontend:** React 19, TypeScript
-   **Build Tool:** Vite
-   **Styling:** Tailwind CSS (via CDN/Script for print) + Custom CSS
-   **AI Model:** Google Gemini 2.0 Flash / Pro (via `@google/genai` SDK)
-   **Icons:** Lucide React

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Demokan09/receipt-reformatter.git
    cd receipt-reformatter
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env.local` file in the root directory (or rename `.env.example`):
    ```env
    gemini_api_key=YOUR_GEMINI_API_KEY_HERE
    ```
    > 🔑 You can get your key from [Google AI Studio](https://aistudio.google.com/).

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open `http://localhost:3000` to see the app.

## 🚀 Deployment

This project is configured for easy deployment on **Netlify**.

1.  Push your code to GitHub.
2.  Import the project in Netlify.
3.  Set the **Build Command** to `npm run build` and **Publish Directory** to `dist`.
4.  **Crucial:** Add your `GEMINI_API_KEY` in the Netlify "Site Settings" > "Environment variables".

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

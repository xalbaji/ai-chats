# 🤖 Simple AI Chatbot Starter — CCIT06 Activity

A pre-configured **MERN stack (React + Express)** starter repository designed for the **CCIT06** laboratory activity. 

This repository provides a fully connected frontend and backend scaffold. Students are expected to complete the activity by implementing their own **AI API integration** (e.g., Google Gemini API, OpenAI, etc.) in the backend service layer.

---

## 🎯 Activity Objective (For Students)
Your objective for this activity is to:
1. Obtain an API key from an AI service provider (e.g., [Google AI Studio](https://aistudio.google.com/) for Gemini).
2. Configure your environment variables in `backend/.env`.
3. Complete the API call logic inside **`backend/services/chatService.js`** to replace the mock response with real AI-generated replies.

---

## 🛠️ Tech Stack & Project Structure

- **Frontend**: React (JSX), Vanilla CSS, Native `fetch()` API
- **Backend**: Node.js, Express.js, `cors`, `dotenv`, `@google/generative-ai`
- **Package Manager**: `pnpm`

### Directory Layout
```text
ai_chat/
├── backend/
│   ├── controllers/       # Handles incoming request logic (chatController.js)
│   ├── routes/            # API endpoints definition (chatRoutes.js)
│   ├── services/          # ⭐ STUDENT TASK: AI API logic (chatService.js)
│   ├── .env.example       # Environment variables template
│   └── server.js          # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Simple React Chatbot UI
│   │   ├── App.css        # Clean chat styles
│   │   └── index.jsx      # React DOM renderer
│   └── .env.example       # Frontend env template
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **pnpm** installed on your system.
```bash
# Verify pnpm installation
pnpm --version
```

### 2. Setup & Installation

#### **Backend Setup**
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create your `.env` file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Open `.env` and add your API key:
   ```env
   PORT=5000
   GEMINI_API_KEY=your_actual_api_key_here
   ```
5. Start the backend development server:
   ```bash
   pnpm dev
   ```
   > Backend runs on `http://localhost:5000`

---

#### **Frontend Setup**
1. Open a **new terminal** and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the frontend development server:
   ```bash
   pnpm start
   ```
   > Frontend runs on `http://localhost:3000`

---

## 📝 Student Task Instructions

Open **`backend/services/chatService.js`** and implement your AI API logic. 

### Example Implementation (Google Gemini):
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateResponse = async (userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in backend/.env');
  }

  // Initialize Gemini client
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Generate AI response
  const result = await model.generateContent(userMessage);
  const response = await result.response;
  return response.text();
};

module.exports = { generateResponse };
```

---

## 📄 License
This repository is pre-configured for academic use in CCIT06 coursework.

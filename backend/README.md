# Backend - AI Chatbot (Student Activity)

## Instructions for Students

### 1. Start the Backend Server
```bash
pnpm dev
# or
npm run dev
```
The backend runs at `http://localhost:5000`.

### 2. Implement Your AI API
Open `services/chatService.js` and add your AI API key / integration (e.g., Google Generative AI / Gemini).

Create a `.env` file in the `backend/` folder:
```env
PORT=5000
GEMINI_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=nivo_ai
JWT_SECRET=replace_with_a_long_random_secret
```

Create a MongoDB Atlas cluster, add the deployed backend's IP address (or `0.0.0.0/0` for a quick demo), create a database user, and copy the generated connection string into `MONGODB_URI`. Never commit the URI or database password.

For Render, use `pnpm install --frozen-lockfile` as the build command and `pnpm start` as the start command. Add `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET`, and `GEMINI_API_KEY` as Render environment variables.

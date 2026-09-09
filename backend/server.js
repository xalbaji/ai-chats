require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');

const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ⬆️ ADDED: Enabled URL-encoded form parsing above so Express can process textual form data alongside image uploads.

// Routes
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.send('AI Chatbot Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('SiliconFlow key loaded:', !!process.env.SILICONFLOW_API_KEY);
});
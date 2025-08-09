import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (html, js, css) from current folder
app.use(express.static(path.join(process.cwd())));

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// API endpoints below (suggestions, faqs, etc.)
// For example:
app.get('/api/faqs', (req, res) => {
  res.json([
    { question: "How to get API key?", answer: "Sign up and get from dashboard." },
    // add more FAQs
  ]);
});

app.post('/api/submit-suggestion', express.json(), (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }
  console.log('Suggestion:', req.body);
  res.json({ success: true, message: "Thanks for your suggestion!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

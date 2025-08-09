import express from 'express';
import path from 'path';
import fs from 'fs';         // <<-- add this import
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

const GMAIL_USER = process.env.GMAIL_USER || "venunathm30@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "qgup vyht qbdh aknx";

const suggestionsFile = path.join(process.cwd(), 'public', 'suggestions.json');
let suggestions = [];

// Load suggestions on startup (move this above routes)
if (fs.existsSync(suggestionsFile)) {
  try {
    const data = fs.readFileSync(suggestionsFile, 'utf-8');
    suggestions = JSON.parse(data);
  } catch(e) {
    console.error("Error parsing suggestions.json:", e);
    suggestions = [];
  }
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

app.use(express.json());

// API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.get('/api/test', (req, res) => res.json({ status: 'API works' }));
app.get('/api/faqs', (req, res) => {
  res.json([
    { question: "How to get API key?", answer: "Sign up and get from dashboard." },
  ]);
});

app.get('/api/suggestions', (req, res) => {
  res.json(suggestions);
});

app.post('/api/save-suggestion', (req, res) => {
  const { name, message } = req.body;
  if (!name || !message) {
    return res.status(400).json({ error: "Missing name or message" });
  }
  const newSuggestion = { name, message, date: new Date().toISOString() };
  suggestions.push(newSuggestion);

  fs.writeFile(suggestionsFile, JSON.stringify(suggestions, null, 2), (err) => {
    if (err) {
      console.error('Failed to save suggestion to file', err);
      return res.status(500).json({ error: 'Failed to save suggestion' });
    }
    res.json({ success: true, message: "Suggestion saved successfully." });
  });
});

app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const mailOptions = {
    from: `"${name}" <${GMAIL_USER}>`,
    to: "fallenangelnaga@nagasoftsolutions.com",
    subject: `New Suggestion from ${name}`,
    text: `
You have a new suggestion/query from the website:

Name: ${name}
Email: ${email}

Message:
${message}
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Suggestion email sent:', info);
    res.json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Static files (put after API routes)
app.use(express.static(path.join(process.cwd(), 'public')));

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

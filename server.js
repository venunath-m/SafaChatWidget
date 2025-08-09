import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

const GMAIL_USER = process.env.GMAIL_USER || "venunathm30@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "qgupvyhtqbdhaknx";

const suggestions = []; // in-memory suggestions

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Use JSON parser middleware first
app.use(express.json());

// API routes first — so static doesn't intercept API calls
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/api/faqs', (req, res) => {
  res.json([
    { question: "How to get API key?", answer: "Sign up and get from dashboard." },
    // add more FAQs
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
  suggestions.push({ name, message, date: new Date().toISOString() });
  console.log('Current suggestions:', suggestions);
  res.json({ success: true, message: "Suggestion saved successfully." });
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

// Finally serve static files, including JS, CSS, assets, etc
app.use(express.static(path.join(process.cwd())));

// Optional: 404 handler for any unknown route
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

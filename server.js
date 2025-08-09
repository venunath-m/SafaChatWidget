import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

// Gmail SMTP credentials (put real secrets in environment variables in production)
const GMAIL_USER = process.env.GMAIL_USER || "venunathm30@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "qgupvyhtqbdhaknx";
const suggestions = []; // store suggestions in-memory
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASSWORD,
  },
});

app.use(express.static(path.join(process.cwd())));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

app.get('/api/faqs', (req, res) => {
  res.json([
    { question: "How to get API key?", answer: "Sign up and get from dashboard." },
    // add more FAQs
  ]);
});

app.post('/api/submit-suggestion', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    suggestions.push({ name, message, date: new Date().toISOString() });

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

    await transporter.sendMail(mailOptions);

    console.log('Suggestion email sent and saved:', { name, email, message });

    res.json({ success: true, message: "Thanks for your suggestion! Email sent and saved." });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: "Failed to send email" });
  }
});



app.get('/api/suggestions', (req, res) => {
res.json(suggestions);
});

app.post('/api/submit-suggestion', async (req, res) => {
const { name, email, message } = req.body;
if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing fields" });
}

// Save suggestion to in-memory array
suggestions.push({ name, message, date: new Date().toISOString() });

// Existing email sending logic here...

res.json({ success: true, message: "Thanks for your suggestion! Email sent and saved." });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

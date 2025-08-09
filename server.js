import express from 'express';
import path from 'path';
import nodemailer from 'nodemailer';

const app = express();
const PORT = process.env.PORT || 3000;

// Gmail SMTP credentials (put real secrets in environment variables in production)
const GMAIL_USER = process.env.GMAIL_USER || "venunathm30@gmail.com";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || "qgup vyht qbdh aknx";

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
    // Prepare email options
    const mailOptions = {
      from: `"${name}" <${GMAIL_USER}>`,  // sender address
      to: "fallenangelnaga@nagasoftsolutions.com", // receiver address
      subject: `New Suggestion from ${name}`,
      text: `
        You have a new suggestion/query from the website:

        Name: ${name}
        Email: ${email}

        Message:
        ${message}
      `,
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    console.log('Suggestion email sent:', { name, email, message });

    res.json({ success: true, message: "Thanks for your suggestion! Email sent." });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import { kv } from '@vercel/kv';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, phone, location, course, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and Phone are required.' });
    }

    // Fetch site data from KV to get dynamic contact email
    let data;
    try {
      data = await kv.get('bpiSiteData');
    } catch (e) {
      console.warn("KV fetch failed, resorting to environment variable or default.", e);
    }
    
    // Fallback to environment variable or generic email if KV fails or is unconfigured
    let toEmail = data?.location?.contactEmail || process.env.CONTACT_EMAIL || 'bpinepal20@gmail.com';

    // Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // App password
      },
    });

    // Check if SMTP is configured, if not, we gracefully simulate success in development
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP credentials not configured. Simulation mode for enquiry.');
      console.log(`[MOCK EMAIL to ${toEmail}]:`, { name, phone, location, course, message });
      return res.status(200).json({ success: true, simulated: true });
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: `New Enquiry from BPI Website: ${name}`,
      text: `
You have a new enquiry from the BPI Website.

Name: ${name}
Phone: ${phone}
Location: ${location || 'N/A'}
Interested Course: ${course || 'N/A'}

Message:
${message || 'No message provided.'}
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Enquiry API Error:', error);
    return res.status(500).json({ error: 'Failed to send enquiry.' });
  }
}

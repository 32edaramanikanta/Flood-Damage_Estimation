// server.cjs (CommonJS)
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

dotenv.config();

const app = express();
//app.get('/api/status', (req, res) => {
//  res.json({ ok: true });
//});
app.use(cors({
  // origin: "http://localhost:5000", // Uncomment and set for production
}));
app.use(express.json());

/*
Required .env variables:
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
TWILIO_SID=
TWILIO_AUTH=
TWILIO_SMS_FROM=
TWILIO_WA_FROM=
RESPONDER_EMAILS=
RESPONDER_SMS_LIST=
RESPONDER_WA_LIST=
PORT= (optional)
*/

// ===== Email (SMTP) =====
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify().then(() => {
  console.log('✅ SMTP ready');
}).catch(err => {
  console.error('❌ SMTP error:', err.message);
});

// ===== Twilio (SMS / WhatsApp) =====
const twilioClient = (process.env.TWILIO_SID && process.env.TWILIO_AUTH)
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH)
  : null;

// ===== Health Check =====
app.get('/api/status', (req, res) => {
  res.json({ ok: true, smtp: !!process.env.SMTP_HOST, sms: !!twilioClient });
});

// ===== Send Email =====
app.post('/api/send-email', async (req, res) => {
  if (!process.env.SMTP_HOST) {
    return res.status(500).json({ success: false, error: "SMTP not configured" });
  }
  try {
    const { to, subject, text } = req.body;
    await transporter.sendMail({
      from: process.env.MAIL_FROM || 'your mail',
      to,
      subject,
      text,
    });
    res.json({ success: true });
  } catch (e) {
    console.error('Email error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ===== Send SMS =====
app.post('/api/send-sms', async (req, res) => {
  if (!twilioClient) {
    return res.status(500).json({ success: false, error: "Twilio not configured" });
  }
  try {
    const { to, text } = req.body;

    const message = await twilioClient.messages.create({
      body: text || "Flood Alert! 🚨 Stay safe.",
      from: process.env.TWILIO_SMS_FROM,   // ✅ Twilio number from .env
      to: to || process.env.TEST_SMS_TO,   // ✅ fallback to verified number
    });

    res.json({ success: true, sid: message.sid });
  } catch (e) {
    console.error('SMS error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ===== Send WhatsApp =====
app.post('/api/send-whatsapp', async (req, res) => {
  if (!twilioClient) {
    return res.status(500).json({ success: false, error: "Twilio not configured" });
  }
  try {
    const { to, text } = req.body; // to must be 'whatsapp:+91XXXXXXXXXX'
    const message = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_WA_FROM,
      body: text || "Flood Alert via WhatsApp! 🚨 Stay safe.",
    });

    res.json({ success: true, sid: message.sid });
  } catch (e) {
    console.error('WhatsApp error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// ===== Help report (fan-out: email + sms + whatsapp) =====
app.post('/api/help/report', async (req, res) => {
  try {
    const p = req.body || {};
    const subject = `🚨 Help needed: ${p.village || 'Unknown village'}, ${p.district || ''}`;
    const summary =
`Reporter: ${p.reporterName} (${p.reporterPhone}, ${p.reporterEmail})
Location: ${p.village}, ${p.district}, ${p.state}
Coords: ${p.lat || '-'}, ${p.lon || '-'}
Needs: ${p.needs}`;

    // email to responders list
    if (process.env.RESPONDER_EMAILS) {
      await transporter.sendMail({
        from: process.env.MAIL_FROM || 'baluedara2@gmail.com',
        to: process.env.RESPONDER_EMAILS,
        subject,
        text: summary,
      });
    }

    // sms to responders
    if (twilioClient && process.env.RESPONDER_SMS_LIST) {
      const phones = process.env.RESPONDER_SMS_LIST.split(',').map(s => s.trim());
      await Promise.all(phones.map(ph =>
        twilioClient.messages.create({
          to: ph,
          from: process.env.TWILIO_SMS_FROM,   // ✅ env Twilio number
          body: summary,
        })
      ));
    }

    // whatsapp to responders
    if (twilioClient && process.env.RESPONDER_WA_LIST) {
      const wnums = process.env.RESPONDER_WA_LIST.split(',').map(s => s.trim()); // 'whatsapp:+91…'
      await Promise.all(wnums.map(ph =>
        twilioClient.messages.create({
          to: ph,
          from: process.env.TWILIO_WA_FROM,   // ✅ env WA sandbox
          body: summary,
        })
      ));
    }

    res.json({ success: true });
  } catch (e) {
    console.error('Help report error:', e);
    res.status(500).json({ success: false, error: e.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API running http://localhost:${PORT}`));
 
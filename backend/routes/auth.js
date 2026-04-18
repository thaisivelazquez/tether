/**
 * POST /auth/send-otp
 *
 * Sends a verification code to the given phone number using Twilio Verify.
 * Twilio handles OTP generation and storage — we don't need to do it ourselves.
 *
 * Body: { phone: string, countryCode: string }
 * Response 200: { message: "OTP sent" }
 * Response 400/500: { error: "..." }
 */

// const router = require("express").Router();
// const twilio = require("twilio");

// router.post("/send-otp", async (req, res) => {
//   const { phone, countryCode = "+1" } = req.body;

//   if (!phone) {
//     return res.status(400).json({ error: "Phone number is required." });
//   }

//   const digits = String(phone).replace(/\D/g, "");
//   if (digits.length < 7) {
//     return res.status(400).json({ error: "Invalid phone number." });
//   }

//   const fullNumber = `${countryCode}${digits}`;

//   const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );

//   try {
//     await client.verify.v2
//       .services(process.env.TWILIO_VERIFY_SERVICE_SID)
//       .verifications.create({ to: fullNumber, channel: "sms" });

//     return res.json({ message: "OTP sent." });
//   } catch (err) {
//     console.error("Twilio error:", err.message);
//     return res.status(500).json({ error: "Failed to send OTP. Try again." });
//   }
// });

// server — /auth/send-otp
// app.post('/auth/send-otp', async (req, res) => {
//   const { email } = req.body;

//   await twilioClient.verify.v2
//     .services(process.env.VERIFY_SERVICE_SID)
//     .verifications.create({
//       to: email,       // ← was phone number
//       channel: 'email' // ← was 'sms'
//     });

//   res.json({ success: true });
// });

// module.exports = router;
const router = require("express").Router();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASS,
  },
});

const otpStore = {};

router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required." });
  }

  const code = Math.floor(10000 + Math.random() * 90000).toString();

  otpStore[email] = {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  console.log(`OTP for ${email}: ${code}`); // backup — visible in terminal

  try {
    await transporter.sendMail({
      from: `"Tether" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Tether verification code",
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
          <h2 style="font-size: 20px; margin-bottom: 8px;">Your verification code</h2>
          <p style="color: #555; margin-bottom: 24px;">Enter this code in the app to verify your email.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #f4f4f4; border-radius: 8px;">
            ${code}
          </div>
          <p style="color: #999; font-size: 13px; margin-top: 16px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Nodemailer error:", err.message);
    return res.status(500).json({ error: "Failed to send code." });
  }
});

module.exports = { router, otpStore };
/**
 * POST /verify/check-otp
 *
 * Checks the OTP via Twilio Verify, then looks up the phone in the DB:
 *   - existing user → { status: "existing_user", user }  → frontend goes to /home
 *   - new user      → { status: "new_user" }             → frontend goes to /tutorial
 *
 * Body: { phone: string, countryCode: string, otp: string }
 */

const router = require("express").Router();
const twilio = require("twilio");
const pool = require("../db");

router.post("/check-otp", async (req, res) => {
  const { phone, countryCode = "+1", otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "phone and otp are required." });
  }

  const digits = String(phone).replace(/\D/g, "");
  const fullNumber = `${countryCode}${digits}`;

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // 1. Check OTP with Twilio Verify
  try {
    const check = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: fullNumber, code: otp });

    if (check.status !== "approved") {
      return res.status(401).json({ error: "Incorrect code. Please try again." });
    }
  } catch (err) {
    console.error("Twilio verify error:", err.message);
    return res.status(401).json({ error: "Invalid or expired code." });
  }

  // 2. Check if user exists in DB
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE phone = $1 LIMIT 1",
      [fullNumber]
    );

    if (rows.length > 0) {
      await pool.query("UPDATE users SET last_used = NOW() WHERE phone = $1", [fullNumber]);
      return res.json({ status: "existing_user", user: rows[0] });
    } else {
      return res.json({ status: "new_user" });
    }
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;
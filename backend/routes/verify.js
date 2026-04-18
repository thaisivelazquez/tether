/**
 * POST /verify/check-otp
 *
 * Checks the OTP via Twilio Verify, then looks up the phone in the DB:
 *   - existing user → { status: "existing_user", user }  → frontend goes to /home
 *   - new user      → { status: "new_user", user }      → frontend goes to /tutorial
 *
 * Body: { phone: string, countryCode: string, otp: string }
 */

// const router = require("express").Router();
// const twilio = require("twilio");
// const pool = require("../db");
// const { v4: uuidv4 } = require("uuid");

// POST /verify/check-otp
// router.post("/check-otp", async (req, res) => {
//   const { phone, countryCode = "+1", otp } = req.body;

//   if (!phone || !otp) {
//     return res.status(400).json({ error: "phone and otp are required." });
//   }

//   const digits = String(phone).replace(/\D/g, "");
//   const fullNumber = `${countryCode}${digits}`;

//   const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );



  

  // 1️⃣ Verify OTP with Twilio
  // try {
  //   const check = await client.verify.v2
  //     .services(process.env.TWILIO_VERIFY_SERVICE_SID)
  //     .verificationChecks.create({ to: fullNumber, code: otp });

  //   if (check.status !== "approved") {
  //     return res.status(401).json({ error: "Incorrect code. Please try again." });
  //   }
  // } catch (err) {
  //   console.error("Twilio verify error:", err.message);
  //   return res.status(401).json({ error: "Invalid or expired code." });
  // }



//   app.post('/verify/check-otp', async (req, res) => {
//   const { email, otp } = req.body;

//   const check = await twilioClient.verify.v2
//     .services(process.env.VERIFY_SERVICE_SID)
//     .verificationChecks.create({ to: email, code: otp });

//   if (check.status !== 'approved') {
//     return res.status(400).json({ error: 'Invalid code.' });
//   }
//   // ... rest of your user lookup logic
// });

//   // 2️⃣ Check if user exists in DB
//   try {
//     const { rows } = await pool.query(
//       "SELECT * FROM users WHERE phone = $1 LIMIT 1",
//       [fullNumber]
//     );

//     if (rows.length > 0) {
//       // Existing user → update last_used
//       await pool.query(
//         "UPDATE users SET last_used = NOW() WHERE phone = $1",
//         [fullNumber]
//       );
//       return res.json({ status: "existing_user", user: rows[0] });
//     } else {
//       // New user → insert into DB
//       const newUserId = uuidv4();
//       await pool.query(
//         `INSERT INTO users (id, phone, first_name, last_name, date_signed_up)
//          VALUES ($1, $2, '', '', NOW())`,
//         [newUserId, fullNumber]
//       );
//       return res.json({ status: "new_user", user: { id: newUserId, phone: fullNumber } });
//     }
//   } catch (err) {
//     console.error("DB error:", err.message);
//     return res.status(500).json({ error: "Server error. Please try again." });
//   }
// });
// const router = require("express").Router();
// const pool = require("../db");
// const { v4: uuidv4 } = require("uuid");
// const { otpStore } = require("./auth"); // import the shared store

// // POST /verify/check-otp
// router.post("/check-otp", async (req, res) => {
//   const { email, otp } = req.body;

//   if (!email || !otp) {
//     return res.status(400).json({ error: "Email and code are required." });
//   }

//   const record = otpStore[email];

//   if (!record) {
//     return res.status(401).json({ error: "No code found. Please request a new one." });
//   }

//   if (Date.now() > record.expiresAt) {
//     delete otpStore[email];
//     return res.status(401).json({ error: "Code expired. Please request a new one." });
//   }

//   if (record.code !== otp) {
//     return res.status(401).json({ error: "Incorrect code. Please try again." });
//   }

//   // Code is valid — clear it
//   delete otpStore[email];

//   // Check if user exists in DB
//   try {
//     const { rows } = await pool.query(
//       "SELECT * FROM users WHERE email = $1 LIMIT 1",
//       [email]
//     );

//     if (rows.length > 0) {
//       await pool.query("UPDATE users SET last_used = NOW() WHERE email = $1", [email]);
//       return res.json({ status: "existing_user", user: rows[0] });
//     } else {
//       const newUserId = uuidv4();
//       await pool.query(
//         `INSERT INTO users (id, email, first_name, last_name, date_signed_up)
//          VALUES ($1, $2, '', '', NOW())`,
//         [newUserId, email]
//       );
//       return res.json({ status: "new_user", user: { id: newUserId, email } });
//     }
//   } catch (err) {
//     console.error("DB error:", err.message);
//     return res.status(500).json({ error: "Server error. Please try again." });
//   }
// });

// module.exports = router;

const router = require("express").Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const { otpStore } = require("./auth");

router.post("/check-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and code are required." });
  }

  const record = otpStore[email];

  if (!record) {
    return res.status(401).json({ error: "No code found. Please request a new one." });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(401).json({ error: "Code expired. Please request a new one." });
  }

  if (record.code !== otp) {
    return res.status(401).json({ error: "Incorrect code. Please try again." });
  }

  delete otpStore[email];

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1 LIMIT 1",
      [email]
    );

    if (rows.length > 0) {
      await pool.query(
        "UPDATE users SET last_used = NOW() WHERE email = $1",
        [email]
      );
      return res.json({ status: "existing_user", user: rows[0] });
    } else {
const newUserId = uuidv4();
await pool.query(
  `INSERT INTO users (id, email, phone, first_name, last_name, date_signed_up, last_used)
   VALUES ($1, $2, $3, '', '', NOW(), NOW())`,
  [newUserId, email, '']
);
return res.json({ status: "new_user", user: { id: newUserId, email } });
      return res.json({ status: "new_user", user: { id: newUserId, email } });
    }
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

module.exports = router;
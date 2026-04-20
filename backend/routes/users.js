/**
 * POST /users/create
 *
 * Called after the tutorial when a new user finishes onboarding.
 * Creates a new row in public.users.
 *
 * Body: { phone, countryCode, firstName, lastName }
 *
 * Response 201: { user }
 * Response 400: { error: "..." }
 * Response 409: { error: "User already exists." }   (race-condition guard)
 *
 * ---
 *
 * GET /users/:id
 *
 * Fetch a user by their ID (used by homepage if needed).
 *
 * Response 200: { user }
 * Response 404: { error: "User not found." }
 */
// const router = require("express").Router();
// const pool = require("../db");
// const { v4: uuidv4 } = require("uuid");

// // POST /users/create
// router.post("/create", async (req, res) => {
//   const { phone, countryCode = "+1", firstName, lastName } = req.body;
//   if (!phone || !firstName || !lastName) {
//     return res.status(400).json({ error: "phone, firstName, and lastName are required." });
//   }
//   const digits = String(phone).replace(/\D/g, "");
//   const fullNumber = phone.startsWith("+") ? phone : `${countryCode}${digits}`;
//   try {
//     const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [fullNumber]);
//     if (existing.rows.length > 0) return res.status(409).json({ error: "User already exists." });
//     const id = uuidv4();
//     const { rows } = await pool.query(
//       `INSERT INTO users (id, phone, first_name, last_name, date_signed_up, last_used, number_of_events)
//        VALUES ($1, $2, $3, $4, NOW(), NOW(), 0) RETURNING *`,
//       [id, fullNumber, firstName.trim(), lastName.trim()]
//     );
//     return res.status(201).json({ user: rows[0] });
//   } catch (err) {
//     console.error("DB error:", err.message);
//     return res.status(500).json({ error: "Server error." });
//   }
// });

// // GET /users/by-phone/:phone  ← MUST be before /:id
// router.get("/by-phone/:phone", async (req, res) => {
//   const raw = decodeURIComponent(req.params.phone);
//   const digits = raw.replace(/\D/g, "");
//   const normalized = `+${digits.startsWith("1") ? digits : "1" + digits}`;
//   try {
//     const { rows } = await pool.query("SELECT * FROM users WHERE phone = $1", [normalized]);
//     if (rows.length === 0) return res.status(404).json({ error: "User not found." });
//     return res.json({ user: rows[0] });
//   } catch (err) {
//     console.error("DB error:", err.message);
//     return res.status(500).json({ error: "Server error." });
//   }
// });

// // GET /users/:id
// router.get("/:id", async (req, res) => {
//   const { id } = req.params;
//   try {
//     const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
//     if (rows.length === 0) return res.status(404).json({ error: "User not found." });
//     return res.json({ user: rows[0] });
//   } catch (err) {
//     console.error("DB error:", err.message);
//     return res.status(500).json({ error: "Server error." });
//   }
// });

// // PATCH /users/:id
// router.patch("/:id", async (req, res) => {
//   const { id } = req.params;
//   const { first_name, last_name, birthdate, location, affiliation, bio } = req.body;
//   const fields = [];
//   const values = [];
//   let index = 1;
//   if (first_name !== undefined) { fields.push(`first_name = $${index++}`); values.push(first_name.trim()); }
//   if (last_name !== undefined)  { fields.push(`last_name = $${index++}`);  values.push(last_name.trim()); }
//   if (birthdate !== undefined)  { fields.push(`birthdate = $${index++}`);  values.push(birthdate); }
//   if (location !== undefined)   { fields.push(`location = $${index++}`);   values.push(location); }
//   if (affiliation !== undefined){ fields.push(`affiliation = $${index++}`);values.push(affiliation); }
//   if (bio !== undefined)        { fields.push(`bio = $${index++}`);        values.push(bio); }
//   if (fields.length === 0) return res.status(400).json({ error: "No fields provided." });
//   fields.push(`last_used = NOW()`);
//   values.push(id);
//   try {
//     const { rows } = await pool.query(
//       `UPDATE users SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
//       values
//     );
//     if (rows.length === 0) return res.status(404).json({ error: "User not found." });
//     return res.json({ user: rows[0] });
//   } catch (err) {
//     console.error("DB error:", err.message);
//     return res.status(500).json({ error: "Server error." });
//   }
// });

// module.exports = router;


// DELETE FROM users
// WHERE phone = "+13475448544";

const router = require("express").Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// POST /users/create
router.post("/create", async (req, res) => {
  const { email, firstName, lastName } = req.body;

  if (!email || !firstName || !lastName) {
    return res.status(400).json({ error: "email, firstName, and lastName are required." });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "User already exists." });

    const id = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO users (id, email, first_name, last_name, date_signed_up, last_used, number_of_events)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), 0) RETURNING *`,
      [id, email.trim(), firstName.trim(), lastName.trim()]
    );
    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// ⚠️ All specific named routes MUST come before /:id
// GET /users/by-email/:email
router.get("/by-email/:email", async (req, res) => {
  const email = decodeURIComponent(req.params.email).trim().toLowerCase();

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found." });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// GET /users/by-phone/:phone  ⚠️ MUST be before /:id
router.get("/by-phone/:phone", async (req, res) => {
  const raw = decodeURIComponent(req.params.phone);
  const digits = raw.replace(/\D/g, "");
  const normalized = `+${digits.startsWith("1") ? digits : "1" + digits}`;

  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE phone = $1", [normalized]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found." });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// GET /users/mutuals?current_user_id=X&friend_user_id=Y  ⚠️ MUST be before /:id
router.get("/mutuals", async (req, res) => {
  const { current_user_id, friend_user_id } = req.query;

  if (!current_user_id || !friend_user_id) {
    return res.status(400).json({ error: "current_user_id and friend_user_id are required." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.first_name, u.last_name
       FROM circle c1
       JOIN circle c2 ON c1.member_user_id = c2.member_user_id
       JOIN users u ON u.id = c1.member_user_id
       WHERE c1.owner_user_id = $1
         AND c2.owner_user_id = $2`,
      [current_user_id, friend_user_id]
    );
    return res.json({ mutuals: rows });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// GET /users/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found." });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// PATCH /users/:id
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, birthdate, location, affiliation, bio } = req.body;

  const fields = [];
  const values = [];
  let index = 1;

  if (first_name !== undefined)  { fields.push(`first_name = $${index++}`);  values.push(first_name.trim()); }
  if (last_name !== undefined)   { fields.push(`last_name = $${index++}`);   values.push(last_name.trim()); }
  if (birthdate !== undefined)   { fields.push(`birthdate = $${index++}`);   values.push(birthdate); }
  if (location !== undefined)    { fields.push(`location = $${index++}`);    values.push(location); }
  if (affiliation !== undefined) { fields.push(`affiliation = $${index++}`); values.push(affiliation); }
  if (bio !== undefined)         { fields.push(`bio = $${index++}`);         values.push(bio); }

  if (fields.length === 0) return res.status(400).json({ error: "No fields provided." });

  fields.push(`last_used = NOW()`);
  values.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found." });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
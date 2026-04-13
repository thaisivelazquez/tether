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
 
const router = require("express").Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// ------------------------------------
// Create new user (called from tutorial completion)
// POST /users/create
// Body: { phone, countryCode, firstName, lastName }
// ------------------------------------
router.post("/create", async (req, res) => {
  const { phone, countryCode = "+1", firstName, lastName } = req.body;

  if (!phone || !firstName || !lastName) {
    return res
      .status(400)
      .json({ error: "phone, firstName, and lastName are required." });
  }

  const digits = String(phone).replace(/\D/g, "");
  const fullNumber = phone.startsWith("+") ? phone : `${countryCode}${digits}`;

  try {
    // Guard against duplicates
    const existing = await pool.query(
      "SELECT id FROM users WHERE phone = $1",
      [fullNumber]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "User already exists." });
    }

    const id = uuidv4();
    const { rows } = await pool.query(
      `INSERT INTO users 
       (id, phone, first_name, last_name, date_signed_up, last_used, number_of_events)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), 0)
       RETURNING *`,
      [id, fullNumber, firstName.trim(), lastName.trim()]
    );

    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ------------------------------------
// Get user by ID
// GET /users/:id
// ------------------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// ------------------------------------
// Get user by phone
// GET /users/by-phone/:phone
// ------------------------------------
router.get("/by-phone/:phone", async (req, res) => {
  const { phone } = req.params;
  if (!phone) return res.status(400).json({ error: "Phone number is required." });

  const normalizedPhone = phone.replace(/\D/g, "");
  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE phone LIKE $1",
      [`%${normalizedPhone}`] // flexible match
    );
    if (rows.length === 0) return res.status(404).json({ error: "User not found." });
    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// ------------------------------------
// Update user info
// PATCH /users/:id
// Body: { first_name, last_name, birthdate, location, affiliation }
// ------------------------------------
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, birthdate, location, affiliation } = req.body;

  try {
    const { rows } = await pool.query(
      `UPDATE users
       SET first_name = $1,
           last_name = $2,
           birthdate = $3,
           location = $4,
           affiliation = $5,
           last_used = NOW()
       WHERE id = $6
       RETURNING *`,
      [first_name, last_name, birthdate, location, affiliation, id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "User not found." });

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;



// DELETE FROM users
// WHERE phone = "+13475448544";
const router = require("express").Router();
const pool = require("../db");

// ------------------------------------
// Send friend request
// POST /friends/request
// Body: { sender_id, receiver_id }
// ------------------------------------
router.post("/request", async (req, res) => {
  const { sender_id, receiver_id } = req.body;
  if (!sender_id || !receiver_id) {
    return res.status(400).json({ error: "sender_id and receiver_id are required." });
  }
  try {
    // Check not already in circle
    const existing = await pool.query(
      "SELECT 1 FROM circle WHERE owner_user_id = $1 AND member_user_id = $2",
      [sender_id, receiver_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Already in your circle." });
    }

    // Check no duplicate pending request
    const dupe = await pool.query(
      "SELECT 1 FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2 AND status = 'pending'",
      [sender_id, receiver_id]
    );
    if (dupe.rows.length > 0) {
      return res.status(400).json({ error: "Request already sent." });
    }

    await pool.query(
      "INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES ($1, $2, 'pending')",
      [sender_id, receiver_id]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// ------------------------------------
// Get pending requests for a user
// GET /friends/requests?user_id=...
// ------------------------------------
router.get("/requests", async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: "user_id is required." });
  try {
    const { rows } = await pool.query(
      `SELECT 
        fr.id,
        fr.sender_id,
        u.first_name,
        u.last_name,
        u.phone
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_id
       WHERE fr.receiver_id = $1 AND fr.status = 'pending'`,
      [user_id]
    );
    return res.json({ requests: rows });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

// ------------------------------------
// Accept or decline a friend request
// PATCH /friends/requests/:id
// Body: { status: "accepted" | "declined" }
// ------------------------------------
router.patch("/requests/:id", async (req, res) => {
  const { status } = req.body;
  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ error: "status must be 'accepted' or 'declined'." });
  }
  try {
    const { rows } = await pool.query(
      "SELECT * FROM friend_requests WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Request not found." });

    const request = rows[0];

    await pool.query(
      "UPDATE friend_requests SET status = $1 WHERE id = $2",
      [status, req.params.id]
    );

    if (status === "accepted") {
      await pool.query(
        `INSERT INTO circle (owner_user_id, member_user_id, circle_type) VALUES
         ($1, $2, 'outer'),
         ($3, $4, 'outer')`,
        [request.sender_id, request.receiver_id, request.receiver_id, request.sender_id]
      );
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("DB error:", err.message);
    return res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
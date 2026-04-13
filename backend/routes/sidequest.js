const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid"); // Run 'npm install uuid'

// ─── GET /events ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        s.*,
        u.first_name AS poster_first_name,
        u.last_name  AS poster_last_name,
        u.location   AS poster_location
      FROM sidequests s
      LEFT JOIN users u ON u.id = s.user_id
      ORDER BY s.time_of_event DESC
    `);

    const sidequests = await Promise.all(
      rows.map(async (row) => {
        const attendees = await getAttendees(row.id);
        return rowToSidequest(row, attendees);
      })
    );

    res.json(sidequests);
  } catch (err) {
    console.error("[GET /events]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /events ─────────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  // Destructure names based on your Postman/Frontend body
  const { 
    user_id, 
    event_title, 
    event_des, 
    location, 
    time_of_event, 
    time_event_end, 
    max_attendees, 
    circle_status
  } = req.body;

  if (!event_title || !user_id) {
    return res.status(400).json({ error: "event_title and user_id are required" });
  }

  try {
    const newId = uuidv4(); // Generate a unique ID for the sidequest

    const { rows } = await pool.query(`
      INSERT INTO sidequests
        (id, user_id, event_title, event_des, location, time_of_event, time_event_end, max_attendees, circle_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      newId,
      user_id,
      event_title,
      event_des,
      location ?? "TBD",
      time_of_event,
      time_event_end,
      max_attendees ?? null,
      circle_status
      
    ]);

    // Fetch full info to return the correct shape
    const { rows: full } = await pool.query(`
      SELECT
        s.*,
        u.first_name AS poster_first_name,
        u.last_name  AS poster_last_name,
        u.location   AS poster_location
      FROM sidequests s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE s.id = $1
    `, [rows[0].id]);

    const attendees = await getAttendees(full[0].id);
    res.status(201).json(rowToSidequest(full[0], attendees));
  } catch (err) {
    console.error("[POST /events]", err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAttendees(sidequestId) {
  const { rows } = await pool.query(`
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.location
    FROM event_attendees ea
    JOIN users u ON u.id = ea.user_id
    WHERE ea.sidequest_id = $1
  `, [sidequestId]);

  return rows.map((r) => ({
    id: r.id,
    name: `${r.first_name} ${r.last_name}`,
    location: r.location ?? "",
  }));
}

function rowToSidequest(row, attendees = []) {
  return {
    id: row.id,
    title: row.event_title,
    description: row.event_des ?? "",
    postedBy: {
      id: row.user_id,
      name: `${row.poster_first_name} ${row.poster_last_name}`,
      location: row.poster_location ?? "",
    },
    attendees,
    startTime: row.time_of_event,
    endTime: row.time_event_end,
    location: row.location ?? "",
    maxAttendees: row.max_attendees ?? 1,
  };
}

module.exports = router;
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// ─── GET /events ─────────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  try {
    const { rows } = await pool.query(`
      SELECT
        s.*,
        u.first_name  AS poster_first_name,
        u.last_name   AS poster_last_name,
        u.location    AS poster_location
      FROM sidequests s
      LEFT JOIN users u ON u.id = s.user_id
      WHERE
        -- 1. You created it
        s.user_id = $1

        OR

        -- 2. Visible to everyone
        s.circle_status = 'everyone'

        OR

        -- 3. Close-friends AND you are in that person's inner circle
        (
          s.circle_status = 'close-friends'
          AND EXISTS (
            SELECT 1 FROM circle c
            WHERE c.owner_user_id  = s.user_id
              AND c.member_user_id = $1
              AND c.circle_type    = 'inner'
          )
        )

      ORDER BY s.time_of_event DESC
    `, [user_id]);

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
  const {
    user_id,
    event_title,
    event_des,
    location,
    time_of_event,
    time_event_end,
    max_attendees,
    circle_status,
  } = req.body;

  if (!event_title || !user_id) {
    return res.status(400).json({ error: "event_title and user_id are required" });
  }

  try {
    const newId = uuidv4();

    const { rows } = await pool.query(`
      INSERT INTO sidequests
        (id, user_id, event_title, event_des, location, time_of_event, time_event_end, max_attendees, circle_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      newId,
      user_id,
      event_title,
      event_des       ?? "",
      location        ?? "TBD",
      time_of_event,
      time_event_end,
      max_attendees   ?? null,
      circle_status,
    ]);

    const { rows: full } = await pool.query(`
      SELECT
        s.*,
        u.first_name  AS poster_first_name,
        u.last_name   AS poster_last_name,
        u.location    AS poster_location
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

// ─── DELETE /events/:id ───────────────────────────────────────────────────────
// Fixed the route path to use ":id"
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query; // Ensure the frontend sends ?user_id=...

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required to delete" });
  }

  try {
    // We include user_id in the WHERE clause. 
    // If the user doesn't own it, 0 rows will be deleted.
    const { rowCount } = await pool.query(
      `DELETE FROM sidequests WHERE id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (rowCount === 0) {
      // If 0 rows were deleted, it either doesn't exist or ownership failed
      return res.status(404).json({ error: "Sidequest not found or unauthorized" });
    }

    res.json({ success: true, message: "Sidequest deleted" });
  } catch (err) {
    console.error('[DELETE /events/:id]', err);
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
    id:          row.id,
    title:       row.event_title,
    description: row.event_des ?? "",
    circleStatus: row.circle_status,
    postedBy: {
      id:       row.user_id,
      name:     `${row.poster_first_name} ${row.poster_last_name}`,
      location: row.poster_location ?? "",
    },
    attendees,
    startTime:    row.time_of_event,
    endTime:      row.time_event_end,
    location:     row.location ?? "",
    maxAttendees: row.max_attendees ?? 1,
  };
}

module.exports = router;
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

router.get("/notifications", async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const { rows } = await pool.query(`
    SELECT
      n.id,
      n.type,
      n.sidequest_id,
      n.is_read,
      n.created_at,

      s.event_title,
      s.event_des,
      s.location,
      s.time_of_event,
      s.circle_status,

      u.first_name AS creator_first_name,
      u.last_name  AS creator_last_name

    FROM notifications n
    JOIN sidequests s ON s.id = n.sidequest_id
    JOIN users u ON u.id = s.user_id
    WHERE n.user_id = $1
      AND n.is_deleted = false
    ORDER BY n.created_at DESC
  `, [user_id]);

  res.json(rows);
});

// Mark notification deleted (swipe away)
router.patch("/notifications/:id/delete", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `UPDATE notifications SET is_deleted = true WHERE id = $1`,
    [id]
  );
  res.json({ success: true });
});

// Mark notification read
router.patch("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1`,
    [id]
  );
  res.json({ success: true });
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

// ─── PATCH /events ─────────────────────────────────────────────────────────────

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query; // same auth pattern as DELETE

  const {
    event_title,
    event_des,
    location,
    time_of_event,
    time_event_end,
    max_attendees,
    circle_status,
  } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required to update" });
  }

  try {
    const { rowCount } = await pool.query(
      `
      UPDATE sidequests
      SET
        event_title = COALESCE($1, event_title),
        event_des = COALESCE($2, event_des),
        location = COALESCE($3, location),
        time_of_event = COALESCE($4, time_of_event),
        time_event_end = COALESCE($5, time_event_end),
        max_attendees = COALESCE($6, max_attendees),
        circle_status = COALESCE($7, circle_status)
      WHERE id = $8 AND user_id = $9
      `,
      [
        event_title,
        event_des,
        location,
        time_of_event,
        time_event_end,
        max_attendees,
        circle_status,
        id,
        user_id,
      ]
    );

    if (rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Sidequest not found or unauthorized" });
    }

    res.json({ success: true, message: "Sidequest updated" });
  } catch (err) {
    console.error("[PATCH /events/:id]", err);
    res.status(500).json({ error: err.message });
  }
});
// ─── POST /events/:id/join ───────────────────────────────────────────────────
router.post("/:id/join", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ Lock ONLY the sidequests row — no JOIN here
    const lockResult = await client.query(
      `SELECT id, user_id, max_attendees
       FROM sidequests
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (lockResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Sidequest not found" });
    }

    const sidequest = lockResult.rows[0];

    // Owner check
    if (String(sidequest.user_id) === String(user_id)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "You already own this sidequest" });
    }

    // Already joined check
    const existing = await client.query(
      `SELECT 1 FROM event_attendees WHERE sidequest_id = $1 AND user_id = $2`,
      [id, user_id]
    );

    if (existing.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "You already joined this sidequest" });
    }

    // Capacity check
    const countResult = await client.query(
      `SELECT COUNT(*)::int AS count FROM event_attendees WHERE sidequest_id = $1`,
      [id]
    );

    const count = countResult.rows[0].count;
    const maxAttendees = sidequest.max_attendees ?? 1;

    if (count >= maxAttendees) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This sidequest is full" });
    }

    // Insert attendee
    await client.query(
      `INSERT INTO event_attendees (sidequest_id, user_id) VALUES ($1, $2)`,
      [id, user_id]
    );

    await client.query("COMMIT");

    // ✅ Fetch full row separately AFTER commit (no FOR UPDATE needed here)
    const { rows: full } = await pool.query(
      `SELECT s.*,
              u.first_name AS poster_first_name,
              u.last_name  AS poster_last_name,
              u.location   AS poster_location
       FROM sidequests s
       LEFT JOIN users u ON u.id = s.user_id
       WHERE s.id = $1`,
      [id]
    );

    const attendees = await getAttendees(id);
    return res.status(200).json(rowToSidequest(full[0], attendees));

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[POST /events/:id/join]", err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
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
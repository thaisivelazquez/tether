const express = require('express');
const router = express.Router();
const pool = require('../db');


router.get('/', async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  try {
    const result = await pool.query(
      `SELECT c.member_user_id, c.circle_type,
              u.first_name, u.last_name, u.phone, u.location, u.bio
       FROM circle c
       JOIN users u ON u.id = c.member_user_id
       WHERE c.owner_user_id = $1`,
      [user_id]
    );
    res.json({ members: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch circle' });
  }
});


router.patch('/:memberId', async (req, res) => {
  const { user_id } = req.query;
  const { memberId } = req.params;
  const { circle_type } = req.body;

  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  if (!['inner', 'outer'].includes(circle_type))
    return res.status(400).json({ error: 'circle_type must be inner or outer' });

  try {
    const result = await pool.query(
      `UPDATE circle SET circle_type = $1
       WHERE owner_user_id = $2 AND member_user_id = $3
       RETURNING *`,
      [circle_type, user_id, memberId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Circle member not found' });
    res.json({ member: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update circle member' });
  }
});


router.delete('/:memberId', async (req, res) => {
  const { user_id } = req.query;
  const { memberId } = req.params;

  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  try {
    const result = await pool.query(
      `DELETE FROM circle WHERE owner_user_id = $1 AND member_user_id = $2`,
      [user_id, memberId]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ error: 'Circle member not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove circle member' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const { getQuery, runQuery, allQuery } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/users (Admin Only - List and search users)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const { search } = req.query;
  let query = "SELECT id, name, email, role, status, created_at FROM users";
  const params = [];

  if (search) {
    query += " WHERE name LIKE ? OR email LIKE ?";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY created_at DESC";

  try {
    const users = await allQuery(query, params);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error retrieving users.' });
  }
});

// PUT /api/users/:id/status (Admin Only - Block/Unblock user)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  const { status } = req.body;

  if (status !== 'active' && status !== 'blocked') {
    return res.status(400).json({ error: 'Status must be active or blocked.' });
  }

  try {
    const user = await getQuery("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot change status of an admin account.' });
    }

    await runQuery("UPDATE users SET status = ? WHERE id = ?", [status, req.params.id]);
    res.json({ message: `User status changed to ${status}.`, userId: req.params.id, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating user status.' });
  }
});

// DELETE /api/users/:id (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await getQuery("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete an admin account.' });
    }

    await runQuery("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error deleting user.' });
  }
});

module.exports = router;

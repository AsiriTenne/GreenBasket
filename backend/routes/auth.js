const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { getQuery, runQuery } = require('../database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  try {
    const existingUser = await getQuery("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await runQuery(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')",
      [name, email, passwordHash]
    );

    const user = { id: result.lastID, name, email, role: 'customer', status: 'active' };
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await getQuery("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked by an administrator.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
    const token = generateToken(userData);

    res.json({ user: userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// POST /api/auth/google (Google OAuth with id_token verification)
router.post('/google', async (req, res) => {
  console.log('[Google Auth] POST /api/auth/google called with body keys:', Object.keys(req.body));
  const { credential } = req.body;

  if (!credential) {
    console.error('[Google Auth] Missing credential in body');
    return res.status(400).json({ error: 'Google credential is required.' });
  }

  if (!googleClient) {
    console.error('[Google Auth] googleClient not initialized - GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
    return res.status(500).json({ error: 'Google OAuth is not configured. Set GOOGLE_CLIENT_ID environment variable.' });
  }

  try {
    console.log('[Google Auth] Verifying idToken...');
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    console.log('[Google Auth] Token verified. Payload email:', payload.email);
    const { email, name, sub } = payload;

    let user = await getQuery("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      console.log('[Google Auth] Creating new user for email:', email);
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const result = await runQuery(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')",
        [name || 'Google User', email, passwordHash]
      );
      user = { id: result.lastID, name: name || 'Google User', email, role: 'customer', status: 'active' };
      console.log('[Google Auth] New user created with id:', user.id);
    } else {
      console.log('[Google Auth] Existing user found:', user.id);
      if (user.status === 'blocked') {
        console.error('[Google Auth] User is blocked');
        return res.status(403).json({ error: 'Your account has been blocked.' });
      }
    }

    const token = generateToken(user);
    console.log('[Google Auth] Login successful, token generated for user:', user.email);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error('[Google Auth] Token verification failed:', err.message, err.stack);
    res.status(500).json({ error: 'Google token verification failed: ' + err.message });
  }
});

// POST /api/auth/facebook (Mock OAuth)
router.post('/facebook', async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required.' });
  }

  try {
    let user = await getQuery("SELECT * FROM users WHERE email = ?", [email]);
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);
      const result = await runQuery(
        "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')",
        [name, email, passwordHash]
      );
      user = { id: result.lastID, name, email, role: 'customer', status: 'active' };
    } else {
      if (user.status === 'blocked') {
        return res.status(403).json({ error: 'Your account has been blocked.' });
      }
    }

    const token = generateToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during Facebook login.' });
  }
});

// POST /api/auth/passkey/register (Protected)
router.post('/passkey/register', authenticateToken, async (req, res) => {
  const { credentialId } = req.body;
  if (!credentialId) {
    return res.status(400).json({ error: 'Credential ID is required.' });
  }

  try {
    await runQuery("UPDATE users SET passkey_credential_id = ? WHERE id = ?", [credentialId, req.user.id]);
    res.json({ success: true, message: 'Passkey registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during Passkey registration.' });
  }
});

// POST /api/auth/passkey/login (Mock WebAuthn authentication)
router.post('/passkey/login', async (req, res) => {
  const { credentialId } = req.body;
  if (!credentialId) {
    return res.status(400).json({ error: 'Credential ID is required.' });
  }

  try {
    const user = await getQuery("SELECT * FROM users WHERE passkey_credential_id = ?", [credentialId]);
    if (!user) {
      return res.status(400).json({ error: 'No user associated with this Passkey.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked.' });
    }

    const userData = { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status };
    const token = generateToken(userData);

    res.json({ user: userData, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during Passkey login.' });
  }
});

// GET /api/auth/me (Protected)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getQuery("SELECT id, name, email, role, status, passkey_credential_id FROM users WHERE id = ?", [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Your account has been blocked.' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching profile.' });
  }
});

// PUT /api/auth/profile (Protected)
router.put('/profile', authenticateToken, async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  try {
    // Check if email taken by another user
    const existing = await getQuery("SELECT * FROM users WHERE email = ? AND id != ?", [email, req.user.id]);
    if (existing) {
      return res.status(400).json({ error: 'Email already taken.' });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      await runQuery(
        "UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?",
        [name, email, passwordHash, req.user.id]
      );
    } else {
      await runQuery(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, req.user.id]
      );
    }

    const updatedUser = await getQuery("SELECT id, name, email, role, status FROM users WHERE id = ?", [req.user.id]);
    res.json({ user: updatedUser, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating profile.' });
  }
});

module.exports = router;

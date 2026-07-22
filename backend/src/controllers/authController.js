const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

/**
 * Admin login only. Students are intentionally NOT handled here — the
 * mobile app's local mock auth already covers self-service student
 * accounts, and there's no shared secret at risk there (each student picks
 * their own password). Admin accounts are the ones that had plaintext
 * passwords shipped in the client bundle before this endpoint existed —
 * this is what actually fixes that.
 *
 * If no admin matches this email, we return 404 rather than 401, so the
 * mobile client's existing catch-and-fallback logic can tell "not an admin,
 * try local student flow" apart from "wrong password."
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email: cleanEmail });

    if (!admin) {
      // Not an admin account — let the client fall back to student mock login.
      return res.status(404).json({ error: 'Not an admin account' });
    }

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = jwt.sign(
      { sub: admin._id, email: admin.email, role: 'admin', clubId: admin.clubId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        isAdmin: true,
        clubId: admin.clubId,
        clubName: admin.clubName,
        college: 'BMSCE',
        branch: 'Admin',
        semester: '-',
        registeredEvents: [],
        activityPoints: 0,
        avatar: null,
      },
    });
  } catch (err) {
    console.error('[authController.login]', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { login };

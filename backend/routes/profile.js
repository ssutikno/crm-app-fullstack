const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// GET my profile details (uses the /api/auth/me route, so this is not needed)

// PUT - Update my profile (name, email)
router.put('/me', auth, async (req, res) => {
    const { name, email } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role_id as role',
            [name, email, req.user.id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT - Change my password
router.put('/me/password', auth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        // Get user's current hash from DB
        const userRes = await db.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
        const password_hash = userRes.rows[0].password_hash;

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const new_password_hash = await bcrypt.hash(newPassword, salt);

        // Update database
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [new_password_hash, req.user.id]);

        res.json({ msg: 'Password updated successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// GET all permissions for a specific role
router.get('/permissions/:roleId', async (req, res) => {
    const { roleId } = req.params;
    try {
        const { rows } = await db.query(
            'SELECT permission_id FROM role_permissions WHERE role_id = $1',
            [roleId]
        );
        // Return a simple array of permission strings, e.g., ['dashboard', 'leads']
        const permissions = rows.map(row => row.permission_id);
        res.json(permissions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST /api/auth/login - Authenticate user and get token
router.post('/login', async (req, res) => {

    const { email, password } = req.body;

    try {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // NEW: Check if the user needs to set their password
        if (!user.is_setup_complete) {
            return res.json({ setupRequired: true, userId: user.id });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
        
        const payload = {
            user: {
                id: user.id,
                role: user.role_id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '30m' },
            (err, token) => {
                if (err) throw err;
                 console.log(`LOGIN SUCCESS: Token generated for user ID ${user.id}`);
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// NEW: Endpoint to complete the initial password setup
router.post('/complete-setup', async (req, res) => {
    const { userId, password } = req.body;
    if (!password || password.length < 6) {
        return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        await db.query(
            'UPDATE users SET password_hash = $1, is_setup_complete = true WHERE id = $2',
            [password_hash, userId]
        );
        res.status(200).json({ msg: 'Setup complete. Please log in.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET the current user's data
router.get('/me', auth, async (req, res) => {
    try {
        // req.user is added by the mockAuth middleware
        const { rows } = await db.query('SELECT id, name, email, role_id as role FROM users WHERE id = $1', [req.user.id]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
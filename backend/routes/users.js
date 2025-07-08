const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Middleware to check for supervisor role
const isSupervisor = (req, res, next) => {
    if (req.user.role !== 'supervisor') {
        return res.status(403).json({ msg: 'Forbidden: requires supervisor privileges' });
    }
    next();
};

// GET all users
router.get('/', [auth, isSupervisor], async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, name, email, role_id, status FROM users ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new user
router.post('/', [auth, isSupervisor], async (req, res) => {
    const { name, email, password, role_id, status } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        const { rows } = await db.query(
            'INSERT INTO users (name, email, password_hash, role_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role_id, status',
            [name, email, password_hash, role_id, status]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT - Update a user's role and status
router.put('/:id', [auth, isSupervisor], async (req, res) => {
    const { id } = req.params;
    const { role_id, status } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE users SET role_id = $1, status = $2 WHERE id = $3 RETURNING id, name, email, role_id, status',
            [role_id, status, id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// NEW: PUT - Reset a user's password
router.put('/:id/reset-password', [auth, isSupervisor], async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (req.user.id === parseInt(id, 10)) {
        return res.status(400).json({ msg: "Supervisors cannot reset their own password through this form." });
    }
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ msg: "Password must be at least 6 characters long." });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(newPassword, salt);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, id]);
        res.json({ msg: 'Password updated successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE a user
router.delete('/:id', [auth, isSupervisor], async (req, res) => {
    const { id } = req.params;
    if (req.user.id === parseInt(id, 10)) {
        return res.status(400).json({ msg: "You cannot delete your own account." });
    }
    try {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
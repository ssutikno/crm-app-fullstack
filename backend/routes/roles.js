const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all roles
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM roles ORDER BY name');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
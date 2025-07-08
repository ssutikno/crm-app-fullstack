const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all deal stages
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM deal_stages ORDER BY sort_order ASC');
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
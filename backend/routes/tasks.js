const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET tasks, filtered by user role
router.get('/', auth, async (req, res) => {
    try {
        let query = `
            SELECT 
                t.*, 
                d.name as deal_name,
                c.name as customer_name,
                u.name as assignee_name
            FROM tasks t
            LEFT JOIN deals d ON t.deal_id = d.id
            LEFT JOIN customers c ON t.customer_id = c.id
            LEFT JOIN users u ON t.assignee_id = u.id
        `;
        const queryParams = [];

        if (['sales', 'telesales'].includes(req.user.role)) {
            queryParams.push(req.user.id);
            query += ` WHERE t.assignee_id = $1`;
        }

        query += ' ORDER BY t.due_date ASC';

        const { rows } = await db.query(query, queryParams);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// NEW: GET data needed for the new task form (deals and customers)
router.get('/form-data', auth, async (req, res) => {
    try {
        const dealsQuery = 'SELECT id, name FROM deals WHERE owner_id = $1 ORDER BY name';
        const customersQuery = 'SELECT id, name FROM customers WHERE owner_id = $1 ORDER BY name';
        
        const [dealsRes, customersRes] = await Promise.all([
            db.query(dealsQuery, [req.user.id]),
            db.query(customersQuery, [req.user.id])
        ]);

        res.json({
            deals: dealsRes.rows,
            customers: customersRes.rows
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new task
router.post('/', auth, async (req, res) => {
    // Convert empty strings to null for foreign keys
    let { title, due_date, priority, deal_id, customer_id } = req.body;
    deal_id = deal_id || null;
    customer_id = customer_id || null;
    
    const assignee_id = req.user.id;
    try {
        const { rows } = await db.query(
            'INSERT INTO tasks (title, due_date, priority, status, assignee_id, deal_id, customer_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, due_date, priority, 'upcoming', assignee_id, deal_id, customer_id]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT - Update a task's status
router.put('/:id/status', auth, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE a task
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM tasks WHERE id = $1', [id]);
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
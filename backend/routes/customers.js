const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all customers (UPDATED with ownership filtering)
router.get('/', auth, async (req, res) => {
    try {
        let query = `
            SELECT c.*, u.name as owner_name 
            FROM customers c 
            LEFT JOIN users u ON c.owner_id = u.id
        `;
        const queryParams = [];

        // NEW: Filter data based on user role
        if (req.user.role === 'sales') {
            queryParams.push(req.user.id);
            query += ` WHERE c.owner_id = $1`;
        }
        
        query += ' ORDER BY c.name ASC';

        const { rows } = await db.query(query, queryParams);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
    
// GET a single customer's details
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const customerRes = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
        if (customerRes.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const contactsRes = await db.query('SELECT * FROM contacts WHERE customer_id = $1', [id]);
        const dealsRes = await db.query('SELECT d.*, ds.name as stage_name FROM deals d LEFT JOIN deal_stages ds ON d.stage_id = ds.id WHERE d.customer_id = $1 ORDER BY d.close_date DESC', [id]);
        const attachmentsRes = await db.query('SELECT * FROM customer_attachments WHERE customer_id = $1 ORDER BY uploaded_at DESC', [id]);

        const customerDetails = {
            ...customerRes.rows[0],
            contacts: contactsRes.rows,
            deals: dealsRes.rows,
            attachments: attachmentsRes.rows
        };
        res.json(customerDetails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new customer
router.post('/', auth, async (req, res) => {
    const { name, industry, address, city, country, website, notes } = req.body;
    const owner_id = req.user.id;
    try {
        const { rows } = await db.query(
            'INSERT INTO customers (name, industry, owner_id, address, city, country, website, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, industry, owner_id, address, city, country, website, notes]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT - Update a customer
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { name, industry, address, city, country, website, notes } = req.body;
    try {
        const customerRes = await db.query('SELECT owner_id FROM customers WHERE id = $1', [id]);
        if (customerRes.rows.length === 0) return res.status(404).json({ msg: 'Customer not found' });
        
        const customerOwnerId = customerRes.rows[0].owner_id;
        const canEdit = req.user.id === customerOwnerId || req.user.role === 'sales_manager';

        if (!canEdit) return res.status(403).json({ msg: 'Forbidden: You do not have permission to edit this customer.' });

        const { rows } = await db.query(
            'UPDATE customers SET name = $1, industry = $2, address = $3, city = $4, country = $5, website = $6, notes = $7 WHERE id = $8 RETURNING *',
            [name, industry, address, city, country, website, notes, id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE a customer
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ msg: 'Forbidden: Only a supervisor can delete customers.' });
        }
        await db.query('DELETE FROM contacts WHERE customer_id = $1', [id]);
        await db.query('DELETE FROM customer_attachments WHERE customer_id = $1', [id]);
        await db.query('DELETE FROM customers WHERE id = $1', [id]);
        res.json({ msg: 'Customer deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all leads (with ownership filtering)
router.get('/', auth, async (req, res) => {
    try {
        let query = 'SELECT l.*, u.name as owner_name FROM leads l LEFT JOIN users u ON l.owner_id = u.id';
        const queryParams = [];

        // Filter data based on user role
        if (['sales', 'telesales'].includes(req.user.role)) {
            queryParams.push(req.user.id);
            query += ' WHERE l.owner_id = $1';
        }

        query += ' ORDER BY l.id DESC';
        const { rows } = await db.query(query, queryParams);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single lead by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT l.*, u.name as owner_name FROM leads l LEFT JOIN users u ON l.owner_id = u.id WHERE l.id = $1', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ msg: 'Lead not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new lead
router.post('/', auth, async (req, res) => {
    const { name, company, email, phone, status, source, score, description } = req.body;
    const owner_id = req.user.id; // Assign to the logged-in user
    try {
        const { rows } = await db.query(
            'INSERT INTO leads (name, company, email, phone, status, source, score, owner_id, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, company, email, phone, status, source, score, owner_id, description]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error('Error saving new lead:', err.message);
        if (err.code === '23505') { // unique_violation
            res.status(400).json({ error: 'Duplicate entry: a lead with this unique field already exists.' });
        } else {
            res.status(500).json({ error: 'Server error: ' + err.message });
        }
    }
});

// PUT - Update a lead
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { name, company, email, phone, status, source, score, description } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE leads SET name=$1, company=$2, email=$3, phone=$4, status=$5, source=$6, score=$7, description=$8 WHERE id=$9 RETURNING *',
            [name, company, email, phone, status, source, score, description, id]
        );
        if (!rows[0]) {
            return res.status(404).json({ error: 'Lead not found or no changes made.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error('Error updating lead:', err.message);
        if (err.code === '23505') { // unique_violation
            res.status(400).json({ error: 'Duplicate entry: a lead with this unique field already exists.' });
        } else {
            res.status(500).json({ error: 'Server error: ' + err.message });
        }
    }
});

// DELETE a lead
router.delete('/:id', auth, async (req, res) => {
    try {
        await db.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
        res.json({ msg: 'Lead deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST - Convert a lead to a customer and a deal
router.post('/:id/convert', auth, async (req, res) => {
    const { id } = req.params;
    const { dealName, dealValue } = req.body;
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        // 1. Get lead info
        const leadRes = await client.query('SELECT * FROM leads WHERE id = $1', [id]);
        if (leadRes.rows.length === 0) {
            throw new Error('Lead not found');
        }
        const lead = leadRes.rows[0];
        if (lead.status === 'Converted') {
            throw new Error('Lead has already been converted');
        }

        // 2. Check for existing customer by name or email
        let customerId = null;
        let customerCheckQuery = 'SELECT id FROM customers WHERE name = $1';
        let customerCheckParams = [lead.company];
        if (lead.email) {
            customerCheckQuery += ' OR email = $2';
            customerCheckParams.push(lead.email);
        }
        const existingCustomer = await client.query(customerCheckQuery, customerCheckParams);
        if (existingCustomer.rows.length > 0) {
            customerId = existingCustomer.rows[0].id;
            // Add a contact for this customer using lead's info
            const contactInsertQuery = 'INSERT INTO contacts (customer_id, name, email, phone) VALUES ($1, $2, $3, $4)';
            await client.query(contactInsertQuery, [customerId, lead.name, lead.email, lead.phone]);
        } else {
            // Insert new customer
            const customerInsertQuery = lead.email
                ? 'INSERT INTO customers (name, email, industry, owner_id) VALUES ($1, $2, $3, $4) RETURNING id'
                : 'INSERT INTO customers (name, industry, owner_id) VALUES ($1, $2, $3) RETURNING id';
            const customerInsertParams = lead.email
                ? [lead.company, lead.email, '', lead.owner_id]
                : [lead.company, '', lead.owner_id];
            const customerRes = await client.query(customerInsertQuery, customerInsertParams);
            customerId = customerRes.rows[0].id;
            // Add a contact for the new customer as well
            const contactInsertQuery = 'INSERT INTO contacts (customer_id, name, email, phone) VALUES ($1, $2, $3, $4)';
            await client.query(contactInsertQuery, [customerId, lead.name, lead.email, lead.phone]);
        }

        // 3. Create a new Deal from the lead, linked to the customer
        const dealQuery = 'INSERT INTO deals (name, value, close_date, customer_id, owner_id, stage_id) VALUES ($1, $2, $3, $4, $5, $6)';
        const closeDate = new Date();
        closeDate.setDate(closeDate.getDate() + 30); // Set close date 30 days out
        await client.query(dealQuery, [dealName, dealValue, closeDate, customerId, lead.owner_id, 1]); // Stage 1 = 'new'

        // 4. Update the lead's status to 'Converted'
        await client.query("UPDATE leads SET status = 'Converted', converted_customer_id = $1 WHERE id = $2", [customerId, id]);

        await client.query('COMMIT');
        res.json({ msg: 'Lead converted successfully', customerId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error converting lead:', err.message);
        if (err.code === '23505') { // unique_violation
            res.status(400).json({ error: 'Duplicate entry: a record with this unique field already exists.' });
        } else {
            res.status(500).json({ error: 'Server error: ' + err.message });
        }
    } finally {
        client.release();
    }
});

module.exports = router;
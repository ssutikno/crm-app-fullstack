const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all quotes with customer and deal info
router.get('/', auth, async (req, res) => {
    try {
        const query = `
            SELECT 
                q.id, q.status, q.total, q.created_at,
                d.name as deal_name, c.name as customer_name
            FROM quotes q
            LEFT JOIN deals d ON q.deal_id = d.id
            LEFT JOIN customers c ON q.customer_id = c.id
            ORDER BY q.created_at DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new quote (UPDATED to also create a task)
router.post('/', auth, async (req, res) => {
    const { deal_id, customer_id, status, subtotal, tax, total, lineItems } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        // 1. Get Deal Name for the task description
        const dealRes = await client.query('SELECT name FROM deals WHERE id = $1', [deal_id]);
        const dealName = dealRes.rows[0]?.name || 'N/A';

        // 2. Insert into the main quotes table
        const quoteQuery = `
            INSERT INTO quotes (id, deal_id, customer_id, status, subtotal, tax, total) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
        const quoteId = `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        const quoteValues = [quoteId, deal_id, customer_id, status, subtotal, tax, total];
        const newQuote = await client.query(quoteQuery, quoteValues);
        const newQuoteId = newQuote.rows[0].id;

        // 3. Insert into the quote_line_items table
        if (lineItems && lineItems.length > 0) {
            const lineItemQuery = 'INSERT INTO quote_line_items (quote_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)';
            for (const item of lineItems) {
                const lineItemValues = [newQuoteId, item.product_id, item.quantity, item.price_at_time];
                await client.query(lineItemQuery, lineItemValues);
            }
        }
        
        // 4. NEW: Create a follow-up task
        const taskTitle = `Follow up on Quote #${newQuoteId} for deal: ${dealName}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3); // Set due date 3 days from now
        const taskQuery = 'INSERT INTO tasks (title, due_date, priority, status, assignee_id, deal_id) VALUES ($1, $2, $3, $4, $5, $6)';
        const taskValues = [taskTitle, dueDate, 'Medium', 'upcoming', req.user.id, deal_id];
        await client.query(taskQuery, taskValues);

        await client.query('COMMIT');
        res.status(201).json({ id: newQuoteId, msg: 'Quote created successfully' });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server error');
    } finally {
        client.release();
    }
});

module.exports = router;
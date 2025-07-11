const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all quotes with search, sort, and pagination
router.get('/', auth, async (req, res) => {
    try {
        const { search, sortBy, direction, page, limit } = req.query;

        let queryParams = [];
        let whereClauses = [];

        // Build WHERE clause for filtering
        if (search) {
            queryParams.push(`%${search}%`);
            whereClauses.push(`(q.id ILIKE $1 OR d.name ILIKE $1 OR c.name ILIKE $1)`);
        }

        const whereCondition = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // THIS IS THE FIX: The count query is now built correctly
        // 1. First query to get the total count of filtered items
        const totalQuery = `
            SELECT COUNT(*) 
            FROM quotes q
            LEFT JOIN deals d ON q.deal_id = d.id
            LEFT JOIN customers c ON q.customer_id = c.id
            ${whereCondition}
        `;
        const totalResult = await db.query(totalQuery, queryParams);
        const totalCount = parseInt(totalResult.rows[0].count, 10);


        // 2. Second query to get the paginated, sorted data
        let dataQuery = `
            SELECT 
                q.id, q.status, q.total, q.created_at,
                d.name as deal_name,
                c.name as customer_name,
                u.name as owner_name
            FROM quotes q
            LEFT JOIN deals d ON q.deal_id = d.id
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN users u ON d.owner_id = u.id
            ${whereCondition}
        `;
        
        const validSortColumns = ['id', 'status', 'total', 'created_at', 'deal_name', 'customer_name'];
        if (sortBy && validSortColumns.includes(sortBy)) {
            const sortDirection = direction === 'desc' ? 'DESC' : 'ASC';
            dataQuery += ` ORDER BY ${sortBy} ${sortDirection}`;
        } else {
            dataQuery += ' ORDER BY q.created_at DESC';
        }

        const pageLimit = parseInt(limit, 10) || 10;
        const currentPage = parseInt(page, 10) || 1;
        const offset = (currentPage - 1) * pageLimit;
        
        queryParams.push(pageLimit, offset);
        dataQuery += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`;

        const { rows } = await db.query(dataQuery, queryParams);
        
        res.json({
            quotes: rows,
            totalCount: totalCount
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single quote with its full details and line items
router.get('/:id', auth, async (req, res) => {
    try {
        const quoteQuery = `
            SELECT q.*, c.name as customer_name, d.name as deal_name 
            FROM quotes q
            LEFT JOIN customers c ON q.customer_id = c.id
            LEFT JOIN deals d ON q.deal_id = d.id
            WHERE q.id = $1`;
        const quoteRes = await db.query(quoteQuery, [req.params.id]);
        if (quoteRes.rows.length === 0) return res.status(404).json({ msg: 'Quote not found' });

        const lineItemsQuery = `
            SELECT qli.*, p.name as product_name, p.sku 
            FROM quote_line_items qli
            JOIN products p ON qli.product_id = p.id
            WHERE qli.quote_id = $1
        `;
        const lineItemsRes = await db.query(lineItemsQuery, [req.params.id]);

        const fullQuote = {
            ...quoteRes.rows[0],
            lineItems: lineItemsRes.rows
        };
        res.json(fullQuote);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new quote
router.post('/', auth, async (req, res) => {
    const { deal_id, customer_id, status, subtotal, tax, total, lineItems } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const dealRes = await client.query('SELECT name FROM deals WHERE id = $1', [deal_id]);
        const dealName = dealRes.rows[0]?.name || 'N/A';

        const quoteQuery = `INSERT INTO quotes (id, deal_id, customer_id, status, subtotal, tax, total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
        const quoteId = `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        const quoteValues = [quoteId, deal_id, customer_id, status, subtotal, tax, total];
        const newQuote = await client.query(quoteQuery, quoteValues);
        const newQuoteId = newQuote.rows[0].id;

        if (lineItems && lineItems.length > 0) {
            const lineItemQuery = 'INSERT INTO quote_line_items (quote_id, product_id, quantity, price_at_time) VALUES ($1, $2, $3, $4)';
            for (const item of lineItems) {
                await client.query(lineItemQuery, [newQuoteId, item.product_id, item.quantity, item.price_at_time]);
            }
        }
        
        const taskTitle = `Follow up on Quote #${newQuoteId} for deal: ${dealName}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);
        const taskQuery = 'INSERT INTO tasks (title, due_date, priority, status, assignee_id, deal_id) VALUES ($1, $2, $3, $4, $5, $6)';
        await client.query(taskQuery, [taskTitle, dueDate, 'Medium', 'upcoming', req.user.id, deal_id]);

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
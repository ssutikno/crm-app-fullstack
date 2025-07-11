const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET Sales summary data for a chart
router.get('/sales-summary', auth, async (req, res) => {
    try {
        // This query sums up the value of 'won' deals per month for the last 12 months
        const query = `
            SELECT 
                TO_CHAR(d.close_date, 'YYYY-MM') as month,
                SUM(d.value) as total_sales
            FROM deals d
            JOIN deal_stages ds ON d.stage_id = ds.id
            WHERE ds.name = 'won' AND d.close_date > NOW() - INTERVAL '12 months'
            GROUP BY month
            ORDER BY month;
        `;
        const { rows } = await db.query(query);
        const chartData = {
            labels: rows.map(r => r.month),
            data: rows.map(r => r.total_sales)
        };
        res.json(chartData);
    } catch (err) { res.status(500).send('Server error'); }
});

// GET Lead funnel data
router.get('/lead-funnel', auth, async (req, res) => {
    try {
        const { rows } = await db.query(`SELECT status, COUNT(*) as count FROM leads GROUP BY status`);
        res.json(rows);
    } catch (err) { res.status(500).send('Server error'); }
});

// GET Top performing sales reps by value of 'won' deals
router.get('/top-reps', auth, async (req, res) => {
    try {
        const query = `
            SELECT u.name, SUM(d.value) as total_won_value
            FROM deals d
            JOIN users u ON d.owner_id = u.id
            JOIN deal_stages ds ON d.stage_id = ds.id
            WHERE ds.name = 'won'
            GROUP BY u.name
            ORDER BY total_won_value DESC
            LIMIT 5;
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) { res.status(500).send('Server error'); }
});

// GET Top selling products by quantity in 'Accepted' quotes
router.get('/top-products', auth, async (req, res) => {
    try {
        const query = `
            SELECT p.name, SUM(qli.quantity) as total_quantity_sold
            FROM quote_line_items qli
            JOIN products p ON qli.product_id = p.id
            JOIN quotes q ON qli.quote_id = q.id
            WHERE q.status = 'Accepted'
            GROUP BY p.name
            ORDER BY total_quantity_sold DESC
            LIMIT 5;
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
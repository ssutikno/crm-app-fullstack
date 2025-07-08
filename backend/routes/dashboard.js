const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET stats for the dashboard cards
router.get('/stats', async (req, res) => {
    try {
        // UPDATED QUERY: Uses a subquery to find deals whose stage is not 'won' or 'lost'
        const openDealsQuery = `
            SELECT SUM(value) as total_value 
            FROM deals 
            WHERE stage_id NOT IN (SELECT id FROM deal_stages WHERE name IN ('won', 'lost'))
        `;

        const [
            newLeadsRes, 
            openDealsRes, 
            tasksDueRes, 
            productRequestsRes
        ] = await Promise.all([
            db.query("SELECT COUNT(*) FROM leads WHERE status = 'New'"),
            db.query(openDealsQuery),
            db.query("SELECT COUNT(*) FROM tasks WHERE status = 'upcoming' AND due_date = CURRENT_DATE"),
            db.query("SELECT COUNT(*) FROM product_requests WHERE status = 'Pending'")
        ]);

        const stats = {
            newLeads: newLeadsRes.rows[0].count || 0,
            openDealsValue: openDealsRes.rows[0].total_value || 0,
            tasksDueToday: tasksDueRes.rows[0].count || 0,
            openProductRequests: productRequestsRes.rows[0].count || 0,
        };

        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET data for the sales chart
router.get('/sales-chart', async (req, res) => {
    try {
        // UPDATED QUERY: Joins with deal_stages to filter by name ('won')
        const query = `
            SELECT
                TO_CHAR(d.close_date, 'YYYY-MM-DD') as date,
                SUM(d.value) as total_sales
            FROM
                deals d
            JOIN
                deal_stages ds ON d.stage_id = ds.id
            WHERE
                ds.name = 'won' AND
                d.close_date >= DATE_TRUNC('month', CURRENT_DATE)
            GROUP BY
                TO_CHAR(d.close_date, 'YYYY-MM-DD')
            ORDER BY
                date;
        `;
        const { rows } = await db.query(query);
        
        const chartData = {
            labels: rows.map(r => r.date),
            data: rows.map(r => r.total_sales),
        };
        res.json(chartData);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
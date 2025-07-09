const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET stats for the dashboard cards
router.get('/stats', auth, async (req, res) => {
    try {
        const { id, role } = req.user;
        let queryParams = [];
        let ownerFilter = '';

        // Apply a filter if the user is not a manager/supervisor
        if (['sales', 'telesales'].includes(role)) {
            queryParams.push(id);
            ownerFilter = ` WHERE owner_id = $1`;
        }

        const openDealsQuery = `
            SELECT SUM(value) as total_value 
            FROM deals d 
            JOIN deal_stages ds ON d.stage_id = ds.id
            ${ownerFilter ? `${ownerFilter} AND` : 'WHERE'} ds.name NOT IN ('won', 'lost')
        `;
        
        const [
            newLeadsRes, openDealsRes, tasksDueRes, productRequestsRes
        ] = await Promise.all([
            db.query(`SELECT COUNT(*) FROM leads ${ownerFilter ? `WHERE status = 'New' AND owner_id = $1` : `WHERE status = 'New'`}`, queryParams),
            db.query(openDealsQuery, queryParams),
            db.query(`SELECT COUNT(*) FROM tasks WHERE status = 'upcoming' AND due_date = CURRENT_DATE ${ownerFilter ? `AND assignee_id = $1` : ''}`, queryParams),
            db.query(`SELECT COUNT(*) FROM product_requests WHERE status = 'Pending' ${ownerFilter ? `AND requested_by_id = $1` : ''}`, queryParams)
        ]);

        const stats = {
            newLeads: newLeadsRes.rows[0].count || 0,
            openDealsValue: openDealsRes.rows[0].total_value || 0,
            tasksDueToday: tasksDueRes.rows[0].count || 0,
            openProductRequests: productRequestsRes.rows[0].count || 0
        };

        res.json(stats);
    } catch (err) { res.status(500).send('Server error'); }
});

// GET data for the sales chart
router.get('/sales-chart', auth, async (req, res) => {
    try {
        const { id, role } = req.user;
        let query = `
            SELECT TO_CHAR(d.close_date, 'YYYY-MM-DD') as date, SUM(d.value) as total_sales
            FROM deals d JOIN deal_stages ds ON d.stage_id = ds.id
            WHERE ds.name = 'won' AND d.close_date >= DATE_TRUNC('month', CURRENT_DATE)
        `;
        const queryParams = [];

        if (['sales', 'telesales'].includes(role)) {
            queryParams.push(id);
            query += ` AND d.owner_id = $1`;
        }

        query += ' GROUP BY date ORDER BY date';
        
        const { rows } = await db.query(query, queryParams);
        const chartData = { labels: rows.map(r => r.date), data: rows.map(r => r.total_sales) };
        res.json(chartData);
    } catch (err) { res.status(500).send('Server error'); }
});

// GET a compiled list of recent activities
router.get('/recent-activity', auth, async (req, res) => {
    try {
        const { id, role } = req.user;
        let ownerFilter = '';
        const queryParams = [id];

        if (['sales', 'telesales'].includes(role)) {
            ownerFilter = ' WHERE owner_id = $1';
        }
        
        const newLeadsQuery = `SELECT id, name, created_at FROM leads ${ownerFilter} ORDER BY created_at DESC LIMIT 5`;
        const wonDealsQuery = `SELECT d.id, d.name, d.close_date as event_date FROM deals d JOIN deal_stages ds ON d.stage_id = ds.id WHERE ds.name = 'won' ${ownerFilter ? `AND d.owner_id = $1` : ''} ORDER BY d.close_date DESC LIMIT 5`;
        
        const [leadsRes, dealsRes] = await Promise.all([
            db.query(newLeadsQuery, ownerFilter ? queryParams : []),
            db.query(wonDealsQuery, ownerFilter ? queryParams : [])
        ]);
        
        const activities = [];
        leadsRes.rows.forEach(lead => activities.push({ type: 'New Lead', description: `A new lead was created: ${lead.name}`, date: lead.created_at, icon: 'fa-bullseye', color: 'text-primary' }));
        dealsRes.rows.forEach(deal => activities.push({ type: 'Deal Won', description: `You won the deal: ${deal.name}`, date: deal.event_date, icon: 'fa-trophy', color: 'text-success' }));
        
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(activities.slice(0, 7));
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
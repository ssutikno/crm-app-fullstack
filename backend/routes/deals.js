const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET all deals, grouped by stage name
router.get('/', auth, async (req, res) => {
    try {
        let query = `
            SELECT d.*, ds.name as stage_name, c.name as company_name, u.name as owner_name
            FROM deals d
            JOIN deal_stages ds ON d.stage_id = ds.id
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN users u ON d.owner_id = u.id
        `;
        const queryParams = [];

        if (req.user.role === 'sales') {
            queryParams.push(req.user.id);
            query += ` WHERE d.owner_id = $1`;
        }
        
        query += ' ORDER BY d.close_date ASC';

        const { rows } = await db.query(query, queryParams);
        
        const groupedDeals = rows.reduce((acc, deal) => {
            const stage = deal.stage_name || 'unknown';
            if (!acc[stage]) {
                acc[stage] = [];
            }
            acc[stage].push(deal);
            return acc;
        }, {});
        res.json(groupedDeals);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single deal by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const dealQuery = `SELECT d.*, ds.name as stage_name, c.name as company_name, u.name as owner_name FROM deals d LEFT JOIN deal_stages ds ON d.stage_id = ds.id LEFT JOIN customers c ON d.customer_id = c.id LEFT JOIN users u ON d.owner_id = u.id WHERE d.id = $1`;
        const dealRes = await db.query(dealQuery, [id]);

        if (dealRes.rows.length === 0) return res.status(404).json({ msg: 'Deal not found' });
        
        const attachmentsRes = await db.query('SELECT * FROM deal_attachments WHERE deal_id = $1', [id]);
        
        const productsRes = await db.query(`SELECT p.*, dp.quantity FROM products p JOIN deal_products dp ON p.id = dp.product_id WHERE dp.deal_id = $1`, [id]);

        const dealDetails = { ...dealRes.rows[0], attachments: attachmentsRes.rows, products: productsRes.rows };
        res.json(dealDetails);
    } catch (err) { res.status(500).send('Server error'); }
});

// PUT update the stage of a single deal
router.put('/:id/stage', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { newStage } = req.body;
        const stageRes = await db.query('SELECT id FROM deal_stages WHERE name = $1', [newStage]);
        if (stageRes.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid stage name' });
        }
        const newStageId = stageRes.rows[0].id;
        const { rows } = await db.query('UPDATE deals SET stage_id = $1 WHERE id = $2 RETURNING *', [newStageId, id]);
        res.json(rows[0]);
    } catch (err) { res.status(500).send('Server error'); }
});

// POST - Link a product to a deal
router.post('/:dealId/products', auth, async (req, res) => {
    const { dealId } = req.params;
    const { productId, quantity } = req.body;
    try {
        await db.query('INSERT INTO deal_products (deal_id, product_id, quantity) VALUES ($1, $2, $3)', [dealId, productId, quantity || 1]);
        res.status(201).json({ msg: 'Product linked to deal successfully.' });
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ msg: 'This product is already linked to the deal.' });
        res.status(500).send('Server error');
    }
});

// THIS IS THE MISSING ROUTE
// PUT - Update a linked product's quantity
router.put('/:dealId/products/:productId', auth, async (req, res) => {
    const { dealId, productId } = req.params;
    const { quantity } = req.body;
    try {
        await db.query('UPDATE deal_products SET quantity = $1 WHERE deal_id = $2 AND product_id = $3', [quantity, dealId, productId]);
        res.json({ msg: 'Product quantity updated.' });
    } catch (err) { 
        console.error(err.message);
        res.status(500).send('Server error'); 
    }
});

// DELETE - Unlink a product from a deal
router.delete('/:dealId/products/:productId', auth, async (req, res) => {
    const { dealId, productId } = req.params;
    try {
        await db.query('DELETE FROM deal_products WHERE deal_id = $1 AND product_id = $2', [dealId, productId]);
        res.json({ msg: 'Product unlinked from deal successfully.' });
    } catch (err) { res.status(500).send('Server error'); }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Middleware to check for product manager/supervisor roles
const canManageProducts = (req, res, next) => {
    if (!['product_manager', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Forbidden: Insufficient permissions' });
    }
    next();
};

// GET all products with optional filtering and searching
router.get('/', auth, async (req, res) => {
    try {
        const { category, search } = req.query;
        let baseQuery = 'SELECT * FROM products';
        const queryParams = [];
        let whereClauses = [];

        if (category) {
            queryParams.push(category);
            whereClauses.push(`category = $${queryParams.length}`);
        }
        if (search) {
            queryParams.push(`%${search}%`);
            whereClauses.push(`(name ILIKE $${queryParams.length} OR sku ILIKE $${queryParams.length})`);
        }

        if (whereClauses.length > 0) {
            baseQuery += ' WHERE ' + whereClauses.join(' AND ');
        }

        baseQuery += ' ORDER BY name ASC';
        
        const { rows } = await db.query(baseQuery, queryParams);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single product with its attachments
router.get('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const productRes = await db.query('SELECT * FROM products WHERE id = $1', [id]);
        if (productRes.rows.length === 0) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        const attachmentsRes = await db.query('SELECT * FROM product_attachments WHERE product_id = $1', [id]);
        const productDetails = {
            ...productRes.rows[0],
            attachments: attachmentsRes.rows
        };
        res.json(productDetails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new product
router.post('/', [auth, canManageProducts], async (req, res) => {
    const { name, sku, category, price, status, description } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO products (name, sku, category, price, status, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, sku, category, price, status, description]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// PUT - Update a product
router.put('/:id', [auth, canManageProducts], async (req, res) => {
    const { id } = req.params;
    const { name, sku, category, price, status, description } = req.body;
    try {
        const { rows } = await db.query(
            'UPDATE products SET name = $1, sku = $2, category = $3, price = $4, status = $5, description = $6 WHERE id = $7 RETURNING *',
            [name, sku, category, price, status, description, id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE a product
router.delete('/:id', [auth, canManageProducts], async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM product_attachments WHERE product_id = $1', [id]); // Also delete related attachments
        await db.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ msg: 'Product deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// --- ROUTES FOR ATTACHMENTS ---

// POST a new attachment for a product
router.post('/:productId/attachments', [auth, canManageProducts], async (req, res) => {
    const { productId } = req.params;
    const { file_name, file_url } = req.body;
    try {
        const { rows } = await db.query(
            'INSERT INTO product_attachments (product_id, file_name, file_url) VALUES ($1, $2, $3) RETURNING *',
            [productId, file_name, file_url]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// DELETE an attachment
router.delete('/:productId/attachments/:attachmentId', [auth, canManageProducts], async (req, res) => {
    const { attachmentId } = req.params;
    try {
        await db.query('DELETE FROM product_attachments WHERE id = $1', [attachmentId]);
        res.json({ msg: 'Attachment deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
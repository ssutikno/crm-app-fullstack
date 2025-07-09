const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Prepend timestamp to filename to ensure uniqueness
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware to check for product manager/supervisor roles
const canManageProductRequests = (req, res, next) => {
    if (!['product_manager', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Forbidden: Insufficient permissions' });
    }
    next();
};

// GET all product requests (for managers)
router.get('/', [auth, canManageProductRequests], async (req, res) => {
    try {
        const query = `
            SELECT 
                pr.*,
                u.name as requested_by_name,
                d.name as deal_name
            FROM product_requests pr
            JOIN users u ON pr.requested_by_id = u.id
            LEFT JOIN deals d ON pr.deal_id = d.id
            ORDER BY pr.request_date DESC
        `;
        const { rows } = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// GET a single product request with its details and attachments
router.get('/:id', [auth, canManageProductRequests], async (req, res) => {
    try {
        const requestRes = await db.query('SELECT * FROM product_requests WHERE id = $1', [req.params.id]);
        if (requestRes.rows.length === 0) {
            return res.status(404).json({ msg: 'Request not found' });
        }

        const attachmentsRes = await db.query('SELECT * FROM product_request_attachments WHERE request_id = $1', [req.params.id]);

        const requestDetails = {
            ...requestRes.rows[0],
            attachments: attachmentsRes.rows
        };
        res.json(requestDetails);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// POST a new product request with file uploads
router.post('/', [auth, upload.array('attachments')], async (req, res) => {
    const { deal_id, requested_product_name, specs } = req.body;
    const requested_by_id = req.user.id;
    const files = req.files;
    
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        
        const requestQuery = 'INSERT INTO product_requests (deal_id, requested_product_name, specs, status, request_date, requested_by_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
        const requestValues = [deal_id, requested_product_name, specs, 'Pending', new Date(), requested_by_id];
        const newRequest = await client.query(requestQuery, requestValues);
        const requestId = newRequest.rows[0].id;

        if (files && files.length > 0) {
            const attachmentQuery = 'INSERT INTO product_request_attachments (request_id, file_name, file_url) VALUES ($1, $2, $3)';
            for (const file of files) {
                const fileUrl = `/uploads/${file.filename}`;
                await client.query(attachmentQuery, [requestId, file.originalname, fileUrl]);
            }
        }
        
        await client.query('COMMIT');
        res.status(201).json({ id: requestId, msg: 'Product request submitted successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server error');
    } finally {
        client.release();
    }
});

// PUT - Approve and convert a request
router.put('/:id/convert', [auth, canManageProductRequests], async (req, res) => {
    const { id } = req.params;
    try {
        const { rows } = await db.query(
            "UPDATE product_requests SET status = 'Completed' WHERE id = $1 RETURNING *",
            [id]
        );
        res.json(rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
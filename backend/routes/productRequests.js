const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');

// Configure Multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Make sure this folder exists
    },
    filename: function (req, file, cb) {
        // Prepend timestamp to filename to ensure uniqueness
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const canManageProductRequests = (req, res, next) => {
    if (!['product_manager', 'supervisor'].includes(req.user.role)) {
        return res.status(403).json({ msg: 'Forbidden: Insufficient permissions' });
    }
    next();
};

// GET all product requests (for managers)
router.get('/', [auth, canManageProductRequests], async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM product_requests ORDER BY request_date DESC');
        res.json(rows);
    } catch (err) { res.status(500).send('Server error'); }
});

// POST a new product request with file uploads
// The 'attachments' string here must match the field name in the FormData object
router.post('/', [auth, upload.array('attachments')], async (req, res) => {
    const { deal_id, requested_product_name, specs } = req.body;
    const requested_by_id = req.user.id;
    const files = req.files; // Files are now available in req.files
    
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
                // The URL is the path where the file is served
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

module.exports = router;
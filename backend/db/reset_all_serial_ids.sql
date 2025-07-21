-- Script to reset all SERIAL id sequences to the current max(id) for each table
-- Run this in psql as a superuser or the database owner

SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), false);
SELECT setval('customers_id_seq', COALESCE((SELECT MAX(id) FROM customers), 1), false);
SELECT setval('contacts_id_seq', COALESCE((SELECT MAX(id) FROM contacts), 1), false);
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1), false);
SELECT setval('product_attachments_id_seq', COALESCE((SELECT MAX(id) FROM product_attachments), 1), false);
SELECT setval('leads_id_seq', COALESCE((SELECT MAX(id) FROM leads), 1), false);
SELECT setval('deal_stages_id_seq', COALESCE((SELECT MAX(id) FROM deal_stages), 1), false);
SELECT setval('deals_id_seq', COALESCE((SELECT MAX(id) FROM deals), 1), false);
SELECT setval('deal_attachments_id_seq', COALESCE((SELECT MAX(id) FROM deal_attachments), 1), false);
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1), false);
SELECT setval('quote_line_items_id_seq', COALESCE((SELECT MAX(id) FROM quote_line_items), 1), false);
SELECT setval('product_requests_id_seq', COALESCE((SELECT MAX(id) FROM product_requests), 1), false);
SELECT setval('product_request_attachments_id_seq', COALESCE((SELECT MAX(id) FROM product_request_attachments), 1), false);
SELECT setval('customer_attachments_id_seq', COALESCE((SELECT MAX(id) FROM customer_attachments), 1), false);

#!/bin/sh
# Reset all SERIAL id sequences in the Postgres database via Docker
# Usage: sh reset_all_serial_ids.sh

docker exec -i crm_db psql -U crmuser -d crmdb <<EOF
\echo 'Resetting users_id_seq for users'
SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1), false);
SELECT last_value FROM users_id_seq;

\echo 'Resetting customers_id_seq for customers'
SELECT setval('customers_id_seq', COALESCE((SELECT MAX(id) FROM customers), 1), false);
SELECT last_value FROM customers_id_seq;

\echo 'Resetting contacts_id_seq for contacts'
SELECT setval('contacts_id_seq', COALESCE((SELECT MAX(id) FROM contacts), 1), false);
SELECT last_value FROM contacts_id_seq;

\echo 'Resetting products_id_seq for products'
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1), false);
SELECT last_value FROM products_id_seq;

\echo 'Resetting product_attachments_id_seq for product_attachments'
SELECT setval('product_attachments_id_seq', COALESCE((SELECT MAX(id) FROM product_attachments), 1), false);
SELECT last_value FROM product_attachments_id_seq;

\echo 'Resetting leads_id_seq for leads'
SELECT setval('leads_id_seq', COALESCE((SELECT MAX(id) FROM leads), 1), false);
SELECT last_value FROM leads_id_seq;

\echo 'Resetting deal_stages_id_seq for deal_stages'
SELECT setval('deal_stages_id_seq', COALESCE((SELECT MAX(id) FROM deal_stages), 1), false);
SELECT last_value FROM deal_stages_id_seq;

\echo 'Resetting deals_id_seq for deals'
SELECT setval('deals_id_seq', COALESCE((SELECT MAX(id) FROM deals), 1), false);
SELECT last_value FROM deals_id_seq;

\echo 'Resetting deal_attachments_id_seq for deal_attachments'
SELECT setval('deal_attachments_id_seq', COALESCE((SELECT MAX(id) FROM deal_attachments), 1), false);
SELECT last_value FROM deal_attachments_id_seq;

\echo 'Resetting tasks_id_seq for tasks'
SELECT setval('tasks_id_seq', COALESCE((SELECT MAX(id) FROM tasks), 1), false);
SELECT last_value FROM tasks_id_seq;

\echo 'Resetting quote_line_items_id_seq for quote_line_items'
SELECT setval('quote_line_items_id_seq', COALESCE((SELECT MAX(id) FROM quote_line_items), 1), false);
SELECT last_value FROM quote_line_items_id_seq;

\echo 'Resetting product_requests_id_seq for product_requests'
SELECT setval('product_requests_id_seq', COALESCE((SELECT MAX(id) FROM product_requests), 1), false);
SELECT last_value FROM product_requests_id_seq;

\echo 'Resetting product_request_attachments_id_seq for product_request_attachments'
SELECT setval('product_request_attachments_id_seq', COALESCE((SELECT MAX(id) FROM product_request_attachments), 1), false);
SELECT last_value FROM product_request_attachments_id_seq;

\echo 'Resetting customer_attachments_id_seq for customer_attachments'
SELECT setval('customer_attachments_id_seq', COALESCE((SELECT MAX(id) FROM customer_attachments), 1), false);
SELECT last_value FROM customer_attachments_id_seq;
EOF

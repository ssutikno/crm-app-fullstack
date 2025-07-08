-- This data is required for the application to work in any environment.

-- 1. Roles Data
INSERT INTO roles (id, name) VALUES
('telesales', 'Telesales'),
('sales', 'Sales'),
('sales_manager', 'Sales Manager'),
('product_manager', 'Product Manager'),
('supervisor', 'Supervisor');

-- 2. Deal Stages Data
INSERT INTO deal_stages (id, name, sort_order) VALUES
(1, 'new', 1),
(2, 'qualifying', 2),
(3, 'proposal', 3),
(4, 'won', 4),
(5, 'lost', 5);

-- 3. Permissions Data
INSERT INTO permissions (id, description) VALUES
('dashboard', 'Access the Dashboard'),
('leads', 'Access Leads'),
('pipeline', 'Access Sales Pipeline'),
('quotes', 'Access Quotes & Proposals'),
('analytics', 'Access Analytics'),
('products', 'Access Product Catalog'),
('product-requests', 'Access Product Requests'),
('customers', 'Access Customers'),
('tasks', 'Access Tasks & Activities'),
('users', 'Access User Management'),
('integrations', 'Access Integration Hub');

-- 4. Role Permissions Data (linking roles to their permissions)
-- Telesales
INSERT INTO role_permissions (role_id, permission_id) VALUES
('telesales', 'dashboard'),
('telesales', 'leads'),
('telesales', 'tasks');

-- Sales
INSERT INTO role_permissions (role_id, permission_id) VALUES
('sales', 'dashboard'),
('sales', 'leads'),
('sales', 'pipeline'),
('sales', 'quotes'),
('sales', 'products'),
('sales', 'customers'),
('sales', 'tasks');

-- Sales Manager
INSERT INTO role_permissions (role_id, permission_id) VALUES
('sales_manager', 'dashboard'),
('sales_manager', 'leads'),
('sales_manager', 'pipeline'),
('sales_manager', 'quotes'),
('sales_manager', 'analytics'),
('sales_manager', 'products'),
('sales_manager', 'customers'),
('sales_manager', 'tasks');

-- Product Manager
INSERT INTO role_permissions (role_id, permission_id) VALUES
('product_manager', 'dashboard'),
('product_manager', 'products'),
('product_manager', 'product-requests');

-- Supervisor (has all permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
('supervisor', 'dashboard'),
('supervisor', 'leads'),
('supervisor', 'pipeline'),
('supervisor', 'quotes'),
('supervisor', 'analytics'),
('supervisor', 'products'),
('supervisor', 'product-requests'),
('supervisor', 'customers'),
('supervisor', 'tasks'),
('supervisor', 'users'),
('supervisor', 'integrations');

-- This user will always be created, even in production.
-- Password is "NULL" to indicate it should be set up on first login.
INSERT INTO users (id, name, email, password_hash, role_id, status, is_setup_complete) VALUES
(99, 'Default Admin', 'admin@example.com', NULL, 'supervisor', 'Active', false);
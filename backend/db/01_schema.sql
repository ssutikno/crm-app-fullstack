-- Drop existing tables in reverse order of creation to avoid dependency errors
DROP TABLE IF EXISTS deal_attachments, customer_attachments, deal_stages, role_permissions, permissions, quote_line_items, quotes, tasks, product_requests, deals, leads, contacts, customers, products, users, roles CASCADE;

-- Create all tables
CREATE TABLE roles (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Now allows NULL for initial setup
    role_id VARCHAR(50) REFERENCES roles(id),
    status VARCHAR(20) DEFAULT 'Active',
    is_setup_complete BOOLEAN DEFAULT false -- NEW: Flag for first-time login
);

CREATE TABLE permissions (
    id VARCHAR(50) PRIMARY KEY,
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id VARCHAR(50) REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(50) REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    industry VARCHAR(100),
    owner_id INT REFERENCES users(id),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    website VARCHAR(255),
    notes TEXT
);

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(50)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    price DECIMAL(10, 2),
    status VARCHAR(50),
    description TEXT
);

CREATE TABLE product_attachments (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(100),
    status VARCHAR(50),
    source VARCHAR(50),
    owner_id INT REFERENCES users(id),
    score INT,
    email VARCHAR(100),
    phone VARCHAR(50),
    description TEXT, -- ADDED a field for notes or description
    converted_customer_id INT REFERENCES customers(id) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE deal_stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    sort_order INT
);

CREATE TABLE deals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value DECIMAL(12, 2),
    close_date DATE,
    notes TEXT,
    customer_id INT REFERENCES customers(id),
    owner_id INT REFERENCES users(id),
    stage_id INT REFERENCES deal_stages(id)
);

CREATE TABLE deal_products (
    deal_id INT REFERENCES deals(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    PRIMARY KEY (deal_id, product_id)
);

CREATE TABLE deal_attachments (
    id SERIAL PRIMARY KEY,
    deal_id INT REFERENCES deals(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    due_date DATE,
    priority VARCHAR(20),
    status VARCHAR(20),
    assignee_id INT REFERENCES users(id),
    deal_id INT REFERENCES deals(id) NULL,
    customer_id INT REFERENCES customers(id) NULL
);

CREATE TABLE quotes (
    id VARCHAR(50) PRIMARY KEY,
    deal_id INT REFERENCES deals(id) ON DELETE CASCADE,
    customer_id INT REFERENCES customers(id),
    status VARCHAR(50),
    subtotal DECIMAL(12, 2),
    tax DECIMAL(12, 2),
    total DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quote_line_items (
    id SERIAL PRIMARY KEY,
    quote_id VARCHAR(50) REFERENCES quotes(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL
);

CREATE TABLE product_requests (
    id SERIAL PRIMARY KEY,
    requested_product_name VARCHAR(255),
    specs TEXT,
    status VARCHAR(50),
    request_date DATE,
    deal_id INT REFERENCES deals(id),
    requested_by_id INT REFERENCES users(id)
);

CREATE TABLE product_request_attachments (
    id SERIAL PRIMARY KEY,
    request_id INT REFERENCES product_requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL
);

CREATE TABLE customer_attachments (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
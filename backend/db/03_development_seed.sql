-- This sample data should ONLY be inserted in a development environment.

-- 1. Sample Users (Password for all is "password123")
INSERT INTO users (id, name, email, password_hash, role_id, status) VALUES
(1, 'John Doe', 'john.doe@example.com', '$2a$10$f/O.lE.SjWClz7fH9i2p1eazyk7t2qK1V2h5dY35U2i3n2I3g2L4S', 'sales', 'Active'),
(2, 'Jane Smith', 'jane.smith@example.com', '$2a$10$f/O.lE.SjWClz7fH9i2p1eazyk7t2qK1V2h5dY35U2i3n2I3g2L4S', 'sales_manager', 'Active'),
(3, 'Mike Ross', 'mike.ross@example.com', '$2a$10$f/O.lE.SjWClz7fH9i2p1eazyk7t2qK1V2h5dY35U2i3n2I3g2L4S', 'sales', 'Active'),
(4, 'Peter Pan', 'peter.pan@example.com', '$2a$10$f/O.lE.SjWClz7fH9i2p1eazyk7t2qK1V2h5dY35U2i3n2I3g2L4S', 'product_manager', 'Active'),
(5, 'Susan Storm', 'susan.storm@example.com', '$2a$10$f/O.lE.SjWClz7fH9i2p1eazyk7t2qK1V2h5dY35U2i3n2I3g2L4S', 'supervisor', 'Active'),
(6, 'Ben Grimm', 'ben.grimm@example.com', '$2a$10$f/O.lE.SjWClz7fH9i2p1eazyk7t2qK1V2h5dY35U2i3n2I3g2L4S', 'telesales', 'Inactive');

-- 2. Sample Customers & Contacts
INSERT INTO customers (id, name, industry, owner_id, address, city, country, website, notes) VALUES 
(1, 'ACME Corp', 'Technology', 1, '123 Innovation Drive', 'Techville', 'USA', 'https://www.acmecorp.com', 'Long-standing client. Key contact is John Miller. Interested in upgrading their workstations in Q4.'),
(2, 'Synergy Group', 'Finance', 1, '456 Financial Plaza', 'Metropolis', 'USA', 'https://www.synergy.com', 'High-value account with potential for enterprise-wide support contract.'),
(3, 'Global Innovations', 'Manufacturing', 2, '789 Factory Rd', 'Industria', 'Germany', 'https://www.globalinnovations.net', 'Focus on IoT and custom hardware solutions.'),
(4, 'Quantum Solutions', 'Technology', 2, 'New customer, focus on cloud services.', '101 Data Ct', 'Binary Bay', 'USA', 'https://www.quantum.io'),
(5, 'Pioneer Logistics', 'Transport', 3, 'Interested in fleet management solutions.', '222 Supply Chain Blvd', 'Port City', 'Canada', 'https://www.pioneerlog.com'),
(6, 'Apex Health', 'Healthcare', 1, 'Large hospital network. Evaluating patient management software.', '333 Wellness Way', 'Care Town', 'USA', 'https://www.apex.health');

INSERT INTO contacts (id, customer_id, name, email, phone) VALUES 
(1, 1, 'John Miller', 'j.miller@acmecorp.com', '555-0101'),(2, 1, 'Susan Bee', 's.bee@acmecorp.com', '555-0102'),
(3, 2, 'Emily White', 'e.white@synergy.com', '555-0201'),(4, 3, 'Peter Chan', 'p.chan@globalinnovations.net', '555-0301'),
(5, 4, 'Dr. Eva Rostova', 'eva.r@quantum.io', '555-0401'),(6, 5, 'Frank Jaeger', 'f.jaeger@pioneerlog.com', '555-0501'),
(7, 6, 'Helen Chu', 'h.chu@apex.health', '555-0601');

-- Sample Leads with descriptions
INSERT INTO leads (id, name, company, status, source, owner_id, description) VALUES
(1, 'John Miller', 'ACME Corp', 'Converted', 'Web Form', 1, 'Expressed strong interest in the new workstation line. Follow up regarding bulk discount.'),
(2, 'Emily White', 'Synergy Group', 'Converted', 'Referral', 1, 'Referred by an existing client. Looking for a full-suite solution.'),
(5, 'Maria Garcia', 'Data Systems Co.', 'Contacted', 'Web Form', 3, 'Scheduled a product demo for next week.'),
(6, 'Bob Smith', 'Tech Solutions Inc.', 'New', 'Advertisement', 1, 'Initial inquiry about laptop pricing.');


-- 4. Sample Deals
INSERT INTO deals (id, customer_id, owner_id, name, stage_id, value, close_date, notes) VALUES
(1, 1, 1, 'ACME Corp - Workstation Upgrade', 3, 50400, '2025-07-25', 'Customer is looking to upgrade 20 workstations.'),
(2, NULL, 1, 'Tech Solutions - New Laptops', 1, 15000, '2025-08-15', 'Initial contact made.'),
(4, 3, 2, 'Global Innovations - Support Contract', 2, 25000, '2025-07-30', 'Qualifying needs with their engineering team.'),
(6, 2, 1, 'Synergy Group - Enterprise Deal', 4, 100000, '2025-06-20', 'Deal won, contract signed.'),
(7, NULL, 2, 'NextGen - Initial Quote', 5, 45000, '2025-06-15', 'Lost to competitor pricing.'),
(8, 2, 2, 'Synergy Group - Security Audit', 2, 18000, '2025-08-30', 'Follow-up scheduled.'),
(9, NULL, 3, 'Innovate LLC - Cloud Migration', 1, 35000, '2025-09-15', 'New lead from marketing campaign.'),
(10, 1, 1, 'ACME Corp - Annual Support Renewal', 3, 22000, '2025-07-28', 'Proposal sent. Awaiting their legal team review.'),
(11, 3, 2, 'Global Innovations - Laptop Refresh', 4, 48000, '2025-07-01', 'Deal won.'),
(12, 4, 2, 'Quantum Solutions - Cloud Services', 3, 75000, '2025-09-20', 'Preparing detailed proposal.'),
(13, 5, 3, 'Pioneer Logistics - Fleet Mgmt Software', 2, 62000, '2025-08-25', 'Initial demo completed, good feedback.'),
(14, 6, 1, 'Apex Health - Patient Portal', 1, 120000, '2025-10-10', 'New high-value opportunity.');

-- 6. Sample Products and Attachments
INSERT INTO products (id, name, sku, category, price, status, description) VALUES
(1, 'GEAR Velocity pro Workstation', 'GV-WS-001', 'Workstations', 2499.00, 'Active', 'High-performance workstation powered by Intel vPro technology.'),
(2, 'GEAR Velocity pro Laptop', 'GV-LP-003', 'Laptops', 1899.00, 'Active', 'Secure and manageable laptop for the modern workforce.'),
(3, 'Enterprise Support Package', 'SUP-ENT-YR', 'Services', 1200.00, 'Active', '24/7 premium support for all your enterprise products.'),
(4, 'Standard On-site Installation', 'SRV-INST-STD', 'Services', 500.00, 'Phasing Out', 'Standard installation service.'),
(5, 'Legacy Server Rack', 'HW-SRV-L01', 'Hardware', 3200.00, 'Discontinued', 'A legacy server rack model.'),
(6, 'GEAR PowerServe R2', 'GS-R2-001', 'Servers', 4500.00, 'Active', 'Robust 2U rack server for small to medium businesses.'),
(7, 'GEAR Vision 27" 4K Monitor', 'GM-27-4K', 'Monitors', 750.00, 'Active', 'Color-accurate 4K UHD monitor.'),
(8, 'GEAR Mobile Docking Station', 'GA-DS-005', 'Accessories', 250.00, 'Active', 'Universal USB-C docking station.'),
(9, 'GEAR SilentKey Pro Keyboard', 'GA-KBD-010', 'Accessories', 99.00, 'Active', 'Mechanical keyboard with silent switches.'),
(10, 'GEAR Velocity pro Mini-PC', 'GV-MPC-002', 'Workstations', 1599.00, 'Active', 'Compact and powerful mini-PC with Intel vPro technology.'),
(11, 'Cloud Storage - 1TB Plan', 'CS-1TB-YR', 'Services', 200.00, 'Active', '1TB annual cloud storage subscription.'),
(12, 'GEAR Vision 34" Ultrawide', 'GM-34-UW', 'Monitors', 950.00, 'Active', '34-inch ultrawide curved monitor.'),
(13, 'GEAR PowerServe T1', 'GS-T1-001', 'Servers', 2800.00, 'Active', 'Quiet and compact tower server.'),
(14, 'GEAR Nomad 14" Laptop', 'GN-LP-14', 'Laptops', 999.00, 'Active', 'Lightweight and affordable laptop.'),
(15, 'Extended Hardware Warranty', 'WAR-EXT-3Y', 'Services', 350.00, 'Active', '3-year extended warranty.'),
(16, 'GEAR Precision Mouse', 'GA-MSE-007', 'Accessories', 79.00, 'Out of Stock', 'High-precision wireless mouse.');

INSERT INTO deal_products (deal_id, product_id, quantity) VALUES
(1, 1, 20), -- Link 'ACME Workstation Upgrade' deal to 20 of the 'GEAR Velocity pro Workstation'
(1, 3, 1); -- Also link it to 1 'Enterprise Support Package'

-- 5. Sample Tasks
INSERT INTO tasks (assignee_id, deal_id, customer_id, title, due_date, priority, status) VALUES
(1, 1, NULL, 'Send revised proposal to ACME Corp', '2025-07-04', 'High', 'upcoming'),
(3, 9, NULL, 'Initial consultation call with Innovate LLC', '2025-07-06', 'High', 'upcoming'),
(1, 2, NULL, 'Follow up with Tech Solutions re: laptop specs', '2025-07-10', 'Medium', 'upcoming'),
(2, 4, 3, 'Review Global Innovations contract', '2025-07-15', 'High', 'upcoming'),
(1, 6, 2, 'Send thank you note to Synergy Group', '2025-06-25', 'Low', 'completed'),
(2, NULL, 3, 'Check in with Global Innovations about Q3 plans', '2025-07-20', 'Low', 'upcoming'),
(1, 14, 6, 'Schedule discovery call with Apex Health IT dept', '2025-07-08', 'High', 'upcoming'),
(3, 13, 5, 'Prepare demo for Pioneer Logistics', '2025-07-18', 'Medium', 'upcoming');


INSERT INTO product_attachments (product_id, file_name, file_url) VALUES (1, 'datasheet_ws.pdf', '#'), (1, 'marketing_brief.pdf', '#'), (2, 'datasheet_laptop.pdf', '#');

-- 7. Sample Quotes and Line Items
INSERT INTO quotes (id, deal_id, customer_id, status, subtotal, tax, total, created_at) VALUES
('QT-2025-0012', 1, 1, 'Sent', 51180.00, 5629.80, 56809.80, '2025-07-01'),
('QT-2025-0011', 6, 2, 'Accepted', 80000.00, 8800.00, 88800.00, '2025-06-18');

INSERT INTO quote_line_items (quote_id, product_id, quantity, price_at_time) VALUES
('QT-2025-0012', 1, 20, 2499.00), ('QT-2025-0012', 3, 1, 1200.00),
('QT-2025-0011', 6, 10, 4500.00), ('QT-2025-0011', 13, 10, 2800.00), ('QT-2025-0011', 15, 20, 350.00);

-- 8. Sample Product Requests
INSERT INTO product_requests(id, deal_id, requested_by_id, requested_product_name, specs, status, request_date) VALUES 
(1, 1, 1, 'GEAR Velocity pro - 128GB RAM', 'Customer requires a configuration with 128GB of DDR5 RAM.', 'Pending', '2025-07-01'),
(2, 4, 2, 'GEAR Nomad 16" Laptop', 'Need a 16-inch version of the Nomad laptop line with a dedicated GPU.', 'Pending', '2025-07-02');

INSERT INTO product_request_attachments (request_id, file_name, file_url) VALUES
(1, 'customer_specs.pdf', '#');

INSERT INTO customer_attachments (customer_id, file_name, file_url) VALUES
(1, 'ACME_MSA.pdf', '#'),
(2, 'Synergy_Onboarding_Docs.zip', '#');
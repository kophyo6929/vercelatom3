-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    credits DECIMAL(10,2) DEFAULT 0.00,
    security_amount INTEGER DEFAULT 0,
    banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    operator VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_mmk INTEGER NOT NULL,
    extra TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id VARCHAR(100) REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    operator VARCHAR(50),
    cost DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending Approval',
    order_type VARCHAR(20) DEFAULT 'PRODUCT',
    delivery_info VARCHAR(255),
    payment_method VARCHAR(50),
    payment_proof TEXT,
    action_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payment accounts table
CREATE TABLE payment_accounts (
    id SERIAL PRIMARY KEY,
    method VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAQ table
CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default data
INSERT INTO users (username, password_hash, is_admin, credits, security_amount) VALUES
('Tw', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, 99999.99, 1111),
('user', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE, 125.50, 2222);

-- Insert default products
INSERT INTO products (id, name, operator, category, price_mmk) VALUES
('atom_pts_500', '500 Points', 'ATOM', 'Points', 1500),
('atom_pts_1000', '1000 Points', 'ATOM', 'Points', 3000),
('atom_pts_2000', '2000 Points', 'ATOM', 'Points', 5500),
('atom_min_50', 'Any-net 50 Mins', 'ATOM', 'Mins', 800),
('atom_min_100', 'Any-net 100 Mins', 'ATOM', 'Mins', 1550),
('atom_min_150', 'Any-net 150 Mins', 'ATOM', 'Mins', 2300),
('atom_pkg_15k', '15k Plan', 'ATOM', 'Internet Packages', 10900),
('atom_pkg_25k', '25k Plan', 'ATOM', 'Internet Packages', 19200),
('atom_data_1gb', '1GB Data', 'ATOM', 'Data', 1000);

-- Insert payment accounts
INSERT INTO payment_accounts (method, account_name, account_number) VALUES
('KPay', 'Atom Point', '09789037037'),
('Wave Pay', 'Atom Point', '09789037037');

-- Insert FAQs
INSERT INTO faqs (question, answer, display_order) VALUES
('How do I buy credits?', 'Navigate to the ''Buy Credits'' section from your dashboard. You can choose a pre-set package or enter a custom amount in MMK. Then, select your preferred payment method (like KPay or Wave Pay), transfer the amount to the provided account details, and upload a screenshot of your payment confirmation. An admin will review and approve your request shortly.', 1),
('How long does it take for my credit purchase to be approved?', 'Our admins review credit purchase requests as quickly as possible, usually within a few minutes to an hour during business hours. You will see the updated credit balance on your dashboard once it''s approved.', 2),
('How do I purchase a product?', 'Go to ''Browse Products'' from the dashboard. Select the operator (e.g., ATOM, MPT), then the category (e.g., Data, Mins), and finally choose the product you want. Click ''Buy'', enter the phone number for delivery, and confirm the purchase. The cost in credits will be deducted from your account balance.', 3);

-- Bảng users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(255) UNIQUE,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_remove BOOLEAN DEFAULT FALSE
);

-- Bảng category
CREATE TABLE category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(255),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_remove BOOLEAN DEFAULT FALSE
);

-- Bảng product
CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    attributes JSONB,
    rate NUMERIC(2, 1),
    star INT,
    description TEXT,
    category_id INT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_remove BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

-- Bảng orders
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT,
    list_product JSONB,  -- Sử dụng array để lưu danh sách sản phẩm
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Bảng shipping
CREATE TABLE shipping (
    ship_id SERIAL PRIMARY KEY,
    order_id INT,
    full_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(15),
    address TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- Bảng payment
CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    order_id INT,
    status VARCHAR(50),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
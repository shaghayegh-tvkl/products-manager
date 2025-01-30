CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL NOT NULL
);

INSERT INTO products (name, price) VALUES ('Laptop', 1200.99), ('Mouse', 25.50), ('Keyboard', 45.00);
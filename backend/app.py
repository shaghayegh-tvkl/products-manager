from flask import Flask, request, jsonify
import psycopg2
import os
from prometheus_client import Counter, generate_latest
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database connection
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_URL = f"postgresql://admin:adminpassword@{DB_HOST}:{DB_PORT}/products_db"
conn = psycopg2.connect(DB_URL)
cursor = conn.cursor()

# Create table if not exists
cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price NUMERIC NOT NULL
    )
''')
conn.commit()

# Prometheus metrics
requests_total = Counter("requests_total", "Total API Requests")

@app.route("/products", methods=["GET"])
def get_products():
    requests_total.inc()
    cursor.execute("SELECT * FROM products")
    products = cursor.fetchall()
    return jsonify([{ "id": p[0], "name": p[1], "price": float(p[2]) } for p in products])

@app.route("/products", methods=["POST"])
def add_product():
    requests_total.inc()
    data = request.json
    cursor.execute("INSERT INTO products (name, price) VALUES (%s, %s) RETURNING id", (data["name"], data["price"]))
    conn.commit()
    return jsonify({ "id": cursor.fetchone()[0] }), 201

@app.route("/products/<int:id>", methods=["PUT"])
def update_product(id):
    requests_total.inc()
    data = request.json
    cursor.execute("UPDATE products SET name = %s, price = %s WHERE id = %s", (data["name"], data["price"], id))
    conn.commit()
    return jsonify({"message": "Product updated successfully"})

@app.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    requests_total.inc()
    cursor.execute("DELETE FROM products WHERE id = %s", (id,))
    conn.commit()
    return jsonify({"message": "Product deleted successfully"})

@app.route("/metrics")
def metrics():
    return generate_latest(), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

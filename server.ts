import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("community.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS store_info (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    photos TEXT,
    contact TEXT,
    phone TEXT,
    email TEXT,
    features TEXT,
    notices TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    stock INTEGER,
    category TEXT,
    isDistribution INTEGER,
    description TEXT,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderNumber TEXT,
    productId INTEGER,
    productName TEXT,
    quantity INTEGER,
    totalAmount REAL,
    status TEXT,
    customerName TEXT,
    customerPhone TEXT,
    customerAddress TEXT,
    createdAt TEXT,
    logisticsInfo TEXT
  );

  CREATE TABLE IF NOT EXISTS service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    title TEXT,
    description TEXT,
    status TEXT,
    customerName TEXT,
    customerPhone TEXT,
    address TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    role TEXT,
    permissions TEXT
  );
`);

// Seed initial data if empty
const storeCount = db.prepare("SELECT count(*) as count FROM store_info").get() as { count: number };
if (storeCount.count === 0) {
  db.prepare("INSERT INTO store_info (name, contact, phone, email) VALUES (?, ?, ?, ?)").run(
    "社区生活直营店", "张经理", "13800138000", "store@example.com"
  );
}

const productCount = db.prepare("SELECT count(*) as count FROM products").get() as { count: number };
if (productCount.count === 0) {
  const seedProducts = [
    { name: "新鲜有机西红柿", price: 12.5, stock: 100, category: "蔬菜", isDistribution: 0 },
    { name: "高山红富士苹果", price: 25.0, stock: 50, category: "水果", isDistribution: 1 },
    { name: "五常大米 5kg", price: 88.0, stock: 30, category: "粮油", isDistribution: 0 },
  ];
  const insertProd = db.prepare("INSERT INTO products (name, price, stock, category, isDistribution) VALUES (?, ?, ?, ?, ?)");
  seedProducts.forEach(p => insertProd.run(p.name, p.price, p.stock, p.category, p.isDistribution));
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes
  app.get("/api/store", (req, res) => {
    const store = db.prepare("SELECT * FROM store_info LIMIT 1").get();
    res.json(store);
  });

  app.post("/api/store", (req, res) => {
    const { name, contact, phone, email, features, notices } = req.body;
    db.prepare("UPDATE store_info SET name=?, contact=?, phone=?, email=?, features=?, notices=? WHERE id=1").run(
      name, contact, phone, email, features, notices
    );
    res.json({ success: true });
  });

  app.get("/api/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
  });

  app.post("/api/products", (req, res) => {
    const { name, price, stock, category, isDistribution, description, image } = req.body;
    const result = db.prepare("INSERT INTO products (name, price, stock, category, isDistribution, description, image) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
      name, price, stock, category, isDistribution ? 1 : 0, description, image
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/orders", (req, res) => {
    const orders = db.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all();
    res.json(orders);
  });

  app.post("/api/orders", (req, res) => {
    const { productId, productName, quantity, totalAmount, customerName, customerPhone, customerAddress } = req.body;
    const orderNumber = "ORD" + Date.now();
    const result = db.prepare("INSERT INTO orders (orderNumber, productId, productName, quantity, totalAmount, status, customerName, customerPhone, customerAddress, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      orderNumber, productId, productName, quantity, totalAmount, 'pending', customerName, customerPhone, customerAddress, new Date().toISOString()
    );
    res.json({ id: result.lastInsertRowid, orderNumber });
  });

  app.patch("/api/orders/:id", (req, res) => {
    const { status, logisticsInfo } = req.body;
    if (status) {
      db.prepare("UPDATE orders SET status=? WHERE id=?").run(status, req.params.id);
    }
    if (logisticsInfo) {
      db.prepare("UPDATE orders SET logisticsInfo=? WHERE id=?").run(logisticsInfo, req.params.id);
    }
    res.json({ success: true });
  });

  app.get("/api/services", (req, res) => {
    const services = db.prepare("SELECT * FROM service_requests ORDER BY createdAt DESC").all();
    res.json(services);
  });

  app.post("/api/services", (req, res) => {
    const { type, title, description, customerName, customerPhone, address } = req.body;
    const result = db.prepare("INSERT INTO service_requests (type, title, description, status, customerName, customerPhone, address, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      type, title, description, 'pending', customerName, customerPhone, address, new Date().toISOString()
    );
    res.json({ id: result.lastInsertRowid });
  });

  app.get("/api/stats", (req, res) => {
    const salesByDay = db.prepare(`
      SELECT date(createdAt) as date, SUM(totalAmount) as total 
      FROM orders 
      WHERE status != 'cancelled' 
      GROUP BY date(createdAt) 
      LIMIT 7
    `).all();
    res.json({ salesByDay });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

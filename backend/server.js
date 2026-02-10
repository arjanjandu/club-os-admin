const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const sequelize = new Sequelize(process.env.SQL_CONNECTION_STRING, {
  dialect: 'mssql',
  logging: false,
  dialectOptions: {
    authentication: {
      type: 'default',
    },
    options: {
      encrypt: true, // For Azure SQL
    }
  }
});

// Models
const Member = sequelize.define('Member', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('Active', 'Banned', 'Pending'), defaultValue: 'Active' }
});

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  category: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT }
});

const Content = sequelize.define('Content', {
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING }, // e.g., Video, PDF
  url: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
});

const Invoice = sequelize.define('Invoice', {
  customerName: { type: DataTypes.STRING },
  amount: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.STRING }, // Paid, Unpaid
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

// Sync Database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Database sync error:', err);
});

// Routes
// Members
app.get('/api/members', async (req, res) => {
  try {
    const members = await Member.findAll();
    res.json(members);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/members', async (req, res) => {
  try {
    const member = await Member.create(req.body);
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/members/:id', async (req, res) => {
  try {
    await Member.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Content
app.get('/api/content', async (req, res) => {
  try {
    const content = await Content.findAll();
    res.json(content);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/content', async (req, res) => {
  try {
    const item = await Content.create(req.body);
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Billing Stub
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.findAll();
    res.json(invoices);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Seed Endpoint (Dev Only)
app.post('/api/seed', async (req, res) => {
  await Member.create({ name: 'John Doe', email: 'john@example.com', status: 'Active' });
  await Product.create({ name: 'PT Session', price: 50.00, category: 'Service' });
  await Content.create({ title: 'Welcome Video', url: 'https://example.com/video.mp4', category: 'Video' });
  await Invoice.create({ customerName: 'John Doe', amount: 50.00, status: 'Paid' });
  res.json({ message: 'Seeded' });
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});

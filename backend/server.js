const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
const sequelize = new Sequelize(process.env.SQL_CONNECTION_STRING, {
  dialect: 'mssql',
  logging: false,
  dialectOptions: { authentication: { type: 'default' }, options: { encrypt: true } }
});

// --- MODELS ---

// 1. Members (The Clients)
const Member = sequelize.define('Member', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING }, // For concierge comms
  status: { type: DataTypes.ENUM('Active', 'Waitlist', 'Banned', 'Pending_Approval'), defaultValue: 'Waitlist' },
  tier: { type: DataTypes.ENUM('Founding', 'Standard', 'Corporate', 'Medical_Only'), defaultValue: 'Standard' },
  joinDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  // Zero-Touch Tokens
  stripe_customer_id: { type: DataTypes.STRING }, 
  gocardless_mandate_id: { type: DataTypes.STRING }
});

// 2. Services (Catalog)
const Service = sequelize.define('Service', {
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM('Class', 'Treatment', 'Consultation'), allowNull: false },
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 60 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  resourceRequired: { type: DataTypes.STRING }, // e.g. "Room 1", "Reformer Studio"
  capacity: { type: DataTypes.INTEGER, defaultValue: 1 } // 1 for treatment, 20 for class
});

// 3. Appointments (Bookings)
const Appointment = sequelize.define('Appointment', {
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('Booked', 'Completed', 'Cancelled', 'NoShow'), defaultValue: 'Booked' },
  notes: { type: DataTypes.TEXT } // Concierge notes (e.g. "Prefer female instructor")
});

// 4. Products (Cafe & Retail)
const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.ENUM('Cafe', 'Retail', 'Supplement'), defaultValue: 'Cafe' },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 100 }
});

// 5. Orders (POS / Tab System)
const Order = sequelize.define('Order', {
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('Pending', 'Paid', 'Tab'), defaultValue: 'Tab' }, // "Tab" = token charge at month end
  items: { type: DataTypes.TEXT } // JSON string of items for simplicity in MVP
});

// 6. Medical Records (Encrypted/Secure Placeholder)
const MedicalRecord = sequelize.define('MedicalRecord', {
  doctorName: { type: DataTypes.STRING },
  summary: { type: DataTypes.TEXT }, // In prod, this field would be encrypted at app level before DB
  secureUrl: { type: DataTypes.STRING }, // Link to external secure doc storage (e.g. Azure Blob with SAS)
  visitDate: { type: DataTypes.DATE }
});

// --- ASSOCIATIONS ---
Member.hasMany(Appointment); Appointment.belongsTo(Member);
Service.hasMany(Appointment); Appointment.belongsTo(Service);

Member.hasMany(Order); Order.belongsTo(Member);
Member.hasOne(MedicalRecord); MedicalRecord.belongsTo(Member);

// --- ROUTES ---

// SEED (The Luxury Data)
app.post('/api/seed-v3', async (req, res) => {
  try {
    if (process.env.SKIP_DB_SYNC !== 'true') {
       await sequelize.sync({ force: true }); // Reset DB for V3 structure
    }

    // 1. Members
    const m1 = await Member.create({ name: 'Alexandra Hamilton', email: 'alex@wealth.com', tier: 'Founding', status: 'Active', phone: '+44 7700 900123' });
    const m2 = await Member.create({ name: 'James Sterling', email: 'james@hedgefund.com', tier: 'Standard', status: 'Active', phone: '+44 7700 900456' });
    const m3 = await Member.create({ name: 'Sarah Chen', email: 'sarah@tech.io', tier: 'Medical_Only', status: 'Waitlist', phone: '+44 7700 900789' });

    // 2. Services
    const s1 = await Service.create({ name: 'Morning Pilates', type: 'Class', durationMinutes: 50, price: 35.00, capacity: 12, resourceRequired: 'Studio A' });
    const s2 = await Service.create({ name: 'Whole Body Cryo', type: 'Treatment', durationMinutes: 15, price: 65.00, capacity: 1, resourceRequired: 'Cryo Chamber' });
    const s3 = await Service.create({ name: 'GP Consultation', type: 'Consultation', durationMinutes: 30, price: 250.00, capacity: 1, resourceRequired: 'Consult Room 1' });

    // 3. Products
    const p1 = await Product.create({ name: 'Matcha Protein Smoothie', category: 'Cafe', price: 12.50 });
    const p2 = await Product.create({ name: 'Tramp Signature Hoodie', category: 'Retail', price: 180.00 });

    // 4. Appointments
    // Today
    const today = new Date();
    await Appointment.create({ startTime: today, endTime: new Date(today.getTime() + 50*60000), status: 'Booked', MemberId: m1.id, ServiceId: s1.id });
    await Appointment.create({ startTime: new Date(today.getTime() + 120*60000), endTime: new Date(today.getTime() + 135*60000), status: 'Completed', MemberId: m2.id, ServiceId: s2.id });
    // Medical appt
    await Appointment.create({ startTime: new Date(today.getTime() + 240*60000), endTime: new Date(today.getTime() + 270*60000), status: 'Booked', MemberId: m3.id, ServiceId: s3.id, notes: 'Follow up on bloodwork' });

    // 5. Orders (Tabs)
    await Order.create({ total: 12.50, status: 'Tab', MemberId: m1.id, items: JSON.stringify([{ name: 'Matcha Smoothie', qty: 1 }]) });
    await Order.create({ total: 192.50, status: 'Paid', MemberId: m2.id, items: JSON.stringify([{ name: 'Hoodie', qty: 1 }, { name: 'Espresso', qty: 1 }]) });

    res.json({ success: true, message: 'Luxury Club V3 Database Seeded' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GETTERS
app.get('/api/members', async (req, res) => { res.json(await Member.findAll()); });
app.get('/api/services', async (req, res) => { res.json(await Service.findAll()); });
app.get('/api/products', async (req, res) => { res.json(await Product.findAll()); });
app.get('/api/appointments', async (req, res) => { 
  res.json(await Appointment.findAll({ include: [Member, Service] })); 
});
app.get('/api/orders', async (req, res) => { 
  res.json(await Order.findAll({ include: [Member] })); 
});

// INSIGHTS API
app.get('/api/insights', async (req, res) => {
  const activeCount = await Member.count({ where: { status: 'Active' } });
  const waitlistCount = await Member.count({ where: { status: 'Waitlist' } });
  const todaysAppointments = await Appointment.count(); // Simplified for MVP
  const pendingRevenue = await Order.sum('total', { where: { status: 'Tab' } }) || 0;
  
  res.json({
    activeMembers: activeCount,
    waitlist: waitlistCount,
    dailyBookings: todaysAppointments,
    openTabsRevenue: pendingRevenue
  });
});

// Conditional Sync on Startup
if (process.env.SKIP_DB_SYNC !== 'true') {
  sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced (Schema Updated)');
  }).catch(err => {
    console.error('Database sync error:', err);
  });
} else {
  console.log('Skipping DB Sync per config');
}

app.listen(port, () => { console.log(`Club OS V3 running on ${port}`); });

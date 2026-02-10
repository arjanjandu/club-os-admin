const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// --- DATABASE ---
const sequelize = new Sequelize(process.env.SQL_CONNECTION_STRING || 'sqlite::memory:', {
  dialect: process.env.SQL_CONNECTION_STRING ? 'mssql' : 'sqlite',
  logging: false,
  dialectOptions: process.env.SQL_CONNECTION_STRING ? { authentication: { type: 'default' }, options: { encrypt: true } } : {}
});

// ========== MODELS ==========

const Member = sequelize.define('Member', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, defaultValue: 'Waitlist' }, // Active, Waitlist, Frozen, Banned, Pending_Approval
  tier: { type: DataTypes.STRING, defaultValue: 'Standard' },   // Founding, Standard, Corporate, Medical_Only
  joinDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  emergencyContact: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  stripe_customer_id: { type: DataTypes.STRING },
  gocardless_mandate_id: { type: DataTypes.STRING },
  subscriptionType: { type: DataTypes.STRING, defaultValue: 'Monthly' }, // Monthly, Annual, Pay_As_You_Go
  monthlyRate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
});

const Staff = sequelize.define('Staff', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, allowNull: false }, // Super_Admin, Manager, Practitioner, Front_Desk
  speciality: { type: DataTypes.STRING },
  bio: { type: DataTypes.TEXT },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Service = sequelize.define('Service', {
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // Class, Treatment, Consultation
  durationMinutes: { type: DataTypes.INTEGER, defaultValue: 60 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  resourceRequired: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER, defaultValue: 1 },
  description: { type: DataTypes.TEXT },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Appointment = sequelize.define('Appointment', {
  startTime: { type: DataTypes.DATE, allowNull: false },
  endTime: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Booked' }, // Booked, Completed, Cancelled, NoShow
  notes: { type: DataTypes.TEXT }
});

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'Cafe' }, // Cafe, Retail, Supplement
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 100 },
  description: { type: DataTypes.TEXT },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Order = sequelize.define('Order', {
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Tab' }, // Pending, Paid, Tab
  items: { type: DataTypes.TEXT },
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'Tab' }, // Tab, Card_Token, Cash
  chargedAt: { type: DataTypes.DATE }
});

const MedicalRecord = sequelize.define('MedicalRecord', {
  doctorName: { type: DataTypes.STRING },
  summary: { type: DataTypes.TEXT },
  secureUrl: { type: DataTypes.STRING },
  visitDate: { type: DataTypes.DATE },
  recordType: { type: DataTypes.STRING, defaultValue: 'General' } // General, Bloodwork, Physio, Consultation
});

const Subscription = sequelize.define('Subscription', {
  type: { type: DataTypes.STRING, allowNull: false }, // Monthly, Annual
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Active' }, // Active, Cancelled, Paused
  startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  nextBillingDate: { type: DataTypes.DATE },
  stripeSubscriptionId: { type: DataTypes.STRING },
  gcMandateId: { type: DataTypes.STRING }
});

const MemberNote = sequelize.define('MemberNote', {
  content: { type: DataTypes.TEXT, allowNull: false },
  createdBy: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, defaultValue: 'General' } // General, Medical, Billing, Behaviour, Follow_Up
});

// ========== ASSOCIATIONS ==========
Member.hasMany(Appointment); Appointment.belongsTo(Member);
Service.hasMany(Appointment); Appointment.belongsTo(Service);
Staff.hasMany(Appointment); Appointment.belongsTo(Staff);
Member.hasMany(Order); Order.belongsTo(Member);
Member.hasMany(MedicalRecord); MedicalRecord.belongsTo(Member);
Member.hasOne(Subscription); Subscription.belongsTo(Member);
Member.hasMany(MemberNote); MemberNote.belongsTo(Member);

// ========== ROUTES ==========

// --- MEMBERS ---
app.get('/api/members', async (req, res) => {
  try { res.json(await Member.findAll({ include: [Subscription], order: [['name', 'ASC']] })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/members/:id', async (req, res) => {
  try {
    const m = await Member.findByPk(req.params.id, {
      include: [
        { model: Appointment, include: [Service, Staff], order: [['startTime', 'DESC']] },
        { model: Order, order: [['createdAt', 'DESC']] },
        { model: MedicalRecord, order: [['visitDate', 'DESC']] },
        { model: MemberNote, order: [['createdAt', 'DESC']] },
        Subscription
      ]
    });
    if (!m) return res.status(404).json({ error: 'Member not found' });
    res.json(m);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/members', async (req, res) => {
  try { res.status(201).json(await Member.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/members/:id', async (req, res) => {
  try {
    const m = await Member.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    await m.update(req.body);
    res.json(m);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/members/:id', async (req, res) => {
  try {
    const m = await Member.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Not found' });
    await m.destroy();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- MEMBER NOTES ---
app.get('/api/members/:id/notes', async (req, res) => {
  try { res.json(await MemberNote.findAll({ where: { MemberId: req.params.id }, order: [['createdAt', 'DESC']] })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/members/:id/notes', async (req, res) => {
  try {
    const note = await MemberNote.create({ ...req.body, MemberId: req.params.id });
    res.status(201).json(note);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/members/:id/notes/:noteId', async (req, res) => {
  try {
    const n = await MemberNote.findByPk(req.params.noteId);
    if (!n) return res.status(404).json({ error: 'Not found' });
    await n.destroy(); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- STAFF ---
app.get('/api/staff', async (req, res) => {
  try { res.json(await Staff.findAll({ order: [['name', 'ASC']] })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/staff', async (req, res) => {
  try { res.status(201).json(await Staff.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/staff/:id', async (req, res) => {
  try {
    const s = await Staff.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    await s.update(req.body); res.json(s);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/staff/:id', async (req, res) => {
  try {
    const s = await Staff.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    await s.destroy(); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SERVICES ---
app.get('/api/services', async (req, res) => {
  try { res.json(await Service.findAll({ order: [['type', 'ASC'], ['name', 'ASC']] })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
// Keep /api/products as alias for backward compat
app.get('/api/products', async (req, res) => {
  try { res.json(await Product.findAll({ order: [['category', 'ASC'], ['name', 'ASC']] })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/services', async (req, res) => {
  try { res.status(201).json(await Service.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/services/:id', async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    await s.update(req.body); res.json(s);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/services/:id', async (req, res) => {
  try {
    const s = await Service.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Not found' });
    await s.destroy(); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- PRODUCTS (Cafe & Retail) ---
app.post('/api/products', async (req, res) => {
  try { res.status(201).json(await Product.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/products/:id', async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await p.update(req.body); res.json(p);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/products/:id', async (req, res) => {
  try {
    const p = await Product.findByPk(req.params.id);
    if (!p) return res.status(404).json({ error: 'Not found' });
    await p.destroy(); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- APPOINTMENTS ---
app.get('/api/appointments', async (req, res) => {
  try { res.json(await Appointment.findAll({ include: [Member, Service, Staff], order: [['startTime', 'ASC']] })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/appointments', async (req, res) => {
  try { res.status(201).json(await Appointment.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const a = await Appointment.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    await a.update(req.body); res.json(a);
  } catch (e) { res.status(400).json({ error: e.message }); }
});
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const a = await Appointment.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'Not found' });
    await a.destroy(); res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- ORDERS ---
app.get('/api/orders', async (req, res) => {
  try { res.json(await Order.findAll({ include: [Member], order: [['createdAt', 'DESC']] })); }
  catch (e) { res.status(500).json({ error: e.message }); }
});
app.post('/api/orders', async (req, res) => {
  try { res.status(201).json(await Order.create(req.body)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});
app.put('/api/orders/:id', async (req, res) => {
  try {
    const o = await Order.findByPk(req.params.id);
    if (!o) return res.status(404).json({ error: 'Not found' });
    await o.update(req.body); res.json(o);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// --- SCHEDULE (grouped by resource) ---
app.get('/api/schedule', async (req, res) => {
  try {
    const appts = await Appointment.findAll({
      include: [Member, Service, Staff],
      order: [['startTime', 'ASC']]
    });
    const grouped = {};
    appts.forEach(a => {
      const resource = a.Service?.resourceRequired || 'Unassigned';
      if (!grouped[resource]) grouped[resource] = [];
      grouped[resource].push(a);
    });
    res.json(grouped);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- INSIGHTS ---
app.get('/api/insights', async (req, res) => {
  try {
    const activeMembers = await Member.count({ where: { status: 'Active' } });
    const waitlist = await Member.count({ where: { status: 'Waitlist' } });
    const frozenMembers = await Member.count({ where: { status: 'Frozen' } });
    const dailyBookings = await Appointment.count({ where: { status: 'Booked' } });
    const completedToday = await Appointment.count({ where: { status: 'Completed' } });
    const openTabsRevenue = await Order.sum('total', { where: { status: 'Tab' } }) || 0;
    const paidRevenue = await Order.sum('total', { where: { status: 'Paid' } }) || 0;
    const totalMembers = await Member.count();
    const totalStaff = await Staff.count();
    res.json({ activeMembers, waitlist, frozenMembers, dailyBookings, completedToday, openTabsRevenue, paidRevenue, totalMembers, totalStaff });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========== SEED ==========
app.post('/api/seed', async (req, res) => {
  try {
    await sequelize.sync({ force: true });
    const today = new Date();
    const h = (hours, mins = 0) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, mins);

    // STAFF
    const staff1 = await Staff.create({ name: 'Dr. Eleanor Voss', email: 'eleanor@tramphealth.com', phone: '+44 7700 100001', role: 'Practitioner', speciality: 'General Practice & Wellness', bio: 'MBBS, 15 years in integrative medicine' });
    const staff2 = await Staff.create({ name: 'Marcus Chen', email: 'marcus@tramphealth.com', phone: '+44 7700 100002', role: 'Practitioner', speciality: 'Strength & Conditioning', bio: 'CSCS certified, former Olympic coach' });
    const staff3 = await Staff.create({ name: 'Sophie Laurent', email: 'sophie@tramphealth.com', phone: '+44 7700 100003', role: 'Practitioner', speciality: 'Pilates & Recovery', bio: 'Polestar certified, 10 years experience' });
    const staff4 = await Staff.create({ name: 'James Whitfield', email: 'james@tramphealth.com', phone: '+44 7700 100004', role: 'Manager', speciality: 'Operations' });
    const staff5 = await Staff.create({ name: 'Amara Osei', email: 'amara@tramphealth.com', phone: '+44 7700 100005', role: 'Front_Desk', speciality: 'Concierge' });

    // MEMBERS
    const m1 = await Member.create({ name: 'Alexandra Hamilton', email: 'alex@wealth.com', phone: '+44 7700 900123', tier: 'Founding', status: 'Active', emergencyContact: 'Charles Hamilton +44 7700 800001', subscriptionType: 'Annual', monthlyRate: 500, stripe_customer_id: 'cus_demo_alex_001' });
    const m2 = await Member.create({ name: 'James Sterling', email: 'james@hedgefund.com', phone: '+44 7700 900456', tier: 'Standard', status: 'Active', subscriptionType: 'Monthly', monthlyRate: 350, stripe_customer_id: 'cus_demo_james_002' });
    const m3 = await Member.create({ name: 'Dr. Sarah Chen', email: 'sarah@tech.io', phone: '+44 7700 900789', tier: 'Medical_Only', status: 'Waitlist', subscriptionType: 'Monthly', monthlyRate: 200 });
    const m4 = await Member.create({ name: 'Victoria Ashworth', email: 'victoria@ashworth.co', phone: '+44 7700 901234', tier: 'Founding', status: 'Active', subscriptionType: 'Annual', monthlyRate: 500, stripe_customer_id: 'cus_demo_victoria_004', gocardless_mandate_id: 'md_demo_004' });
    const m5 = await Member.create({ name: 'Oliver Blackwood', email: 'oliver@blackwood.vc', phone: '+44 7700 902345', tier: 'Corporate', status: 'Active', subscriptionType: 'Monthly', monthlyRate: 450, stripe_customer_id: 'cus_demo_oliver_005' });
    const m6 = await Member.create({ name: 'Isabella Romano', email: 'isabella@romano.it', phone: '+44 7700 903456', tier: 'Standard', status: 'Frozen', subscriptionType: 'Monthly', monthlyRate: 350, notes: 'Travelling until March - requested freeze' });
    const m7 = await Member.create({ name: 'Hugo Pemberton', email: 'hugo@pemberton.uk', phone: '+44 7700 904567', tier: 'Founding', status: 'Active', subscriptionType: 'Annual', monthlyRate: 500, stripe_customer_id: 'cus_demo_hugo_007' });

    // SUBSCRIPTIONS
    const nextMonth = new Date(today); nextMonth.setMonth(nextMonth.getMonth() + 1);
    await Subscription.create({ type: 'Annual', amount: 6000, status: 'Active', MemberId: m1.id, nextBillingDate: new Date(today.getFullYear(), 11, 1), stripeSubscriptionId: 'sub_demo_001' });
    await Subscription.create({ type: 'Monthly', amount: 350, status: 'Active', MemberId: m2.id, nextBillingDate: nextMonth, stripeSubscriptionId: 'sub_demo_002' });
    await Subscription.create({ type: 'Monthly', amount: 450, status: 'Active', MemberId: m5.id, nextBillingDate: nextMonth, stripeSubscriptionId: 'sub_demo_005' });
    await Subscription.create({ type: 'Monthly', amount: 350, status: 'Paused', MemberId: m6.id, nextBillingDate: null });
    await Subscription.create({ type: 'Annual', amount: 6000, status: 'Active', MemberId: m4.id, nextBillingDate: new Date(today.getFullYear(), 5, 1), gcMandateId: 'md_demo_004' });
    await Subscription.create({ type: 'Annual', amount: 6000, status: 'Active', MemberId: m7.id, nextBillingDate: new Date(today.getFullYear(), 8, 15), stripeSubscriptionId: 'sub_demo_007' });

    // SERVICES
    const s1 = await Service.create({ name: 'Morning Reformer Pilates', type: 'Class', durationMinutes: 50, price: 45, capacity: 12, resourceRequired: 'Studio A', description: 'Full-body reformer session focusing on core stability and flexibility' });
    const s2 = await Service.create({ name: 'HIIT Circuit', type: 'Class', durationMinutes: 45, price: 35, capacity: 16, resourceRequired: 'Gym Floor', description: 'High-intensity interval training with expert coaching' });
    const s3 = await Service.create({ name: 'Whole Body Cryotherapy', type: 'Treatment', durationMinutes: 15, price: 85, capacity: 1, resourceRequired: 'Cryo Chamber', description: '-110°C whole body exposure for recovery and inflammation reduction' });
    const s4 = await Service.create({ name: 'Sports Massage', type: 'Treatment', durationMinutes: 60, price: 120, capacity: 1, resourceRequired: 'Treatment Room 1', description: 'Deep tissue sports massage with certified therapist' });
    const s5 = await Service.create({ name: 'GP Consultation', type: 'Consultation', durationMinutes: 30, price: 250, capacity: 1, resourceRequired: 'Consult Room 1', description: 'Private GP consultation with Dr. Voss' });
    const s6 = await Service.create({ name: 'Wellness Review', type: 'Consultation', durationMinutes: 60, price: 350, capacity: 1, resourceRequired: 'Consult Room 1', description: 'Comprehensive wellness review including bloodwork analysis' });
    const s7 = await Service.create({ name: 'Yoga Flow', type: 'Class', durationMinutes: 60, price: 40, capacity: 15, resourceRequired: 'Studio B', description: 'Vinyasa flow session suitable for all levels' });

    // PRODUCTS
    await Product.create({ name: 'Matcha Protein Smoothie', category: 'Cafe', price: 12.50, description: 'Organic matcha with whey protein and oat milk' });
    await Product.create({ name: 'Açaí Power Bowl', category: 'Cafe', price: 14.00, description: 'Fresh açaí with granola, berries and honey' });
    await Product.create({ name: 'Cold-Pressed Green Juice', category: 'Cafe', price: 9.50, description: 'Kale, cucumber, apple, ginger and lemon' });
    await Product.create({ name: 'Espresso', category: 'Cafe', price: 4.50, description: 'Single-origin Ethiopian espresso' });
    await Product.create({ name: 'Tramp Signature Hoodie', category: 'Retail', price: 180, stock: 25, description: 'Premium heavyweight cotton, embroidered logo' });
    await Product.create({ name: 'Performance Water Bottle', category: 'Retail', price: 45, stock: 50, description: 'Insulated stainless steel, 750ml' });
    await Product.create({ name: 'Omega-3 Complex', category: 'Supplement', price: 38, stock: 40, description: 'High-strength fish oil, 60 capsules' });
    await Product.create({ name: 'Magnesium Glycinate', category: 'Supplement', price: 28, stock: 35, description: 'Bioavailable magnesium for recovery, 90 tablets' });

    // APPOINTMENTS (Today's schedule)
    await Appointment.create({ startTime: h(7, 0), endTime: h(7, 50), status: 'Completed', MemberId: m1.id, ServiceId: s1.id, StaffId: staff3.id, notes: 'Regular Monday slot' });
    await Appointment.create({ startTime: h(7, 0), endTime: h(7, 50), status: 'Completed', MemberId: m4.id, ServiceId: s1.id, StaffId: staff3.id });
    await Appointment.create({ startTime: h(8, 0), endTime: h(8, 45), status: 'Completed', MemberId: m2.id, ServiceId: s2.id, StaffId: staff2.id });
    await Appointment.create({ startTime: h(9, 0), endTime: h(9, 15), status: 'Booked', MemberId: m5.id, ServiceId: s3.id, StaffId: staff2.id });
    await Appointment.create({ startTime: h(10, 0), endTime: h(11, 0), status: 'Booked', MemberId: m1.id, ServiceId: s4.id, StaffId: staff2.id, notes: 'Focus on right shoulder' });
    await Appointment.create({ startTime: h(11, 0), endTime: h(11, 30), status: 'Booked', MemberId: m7.id, ServiceId: s5.id, StaffId: staff1.id, notes: 'Annual health review follow-up' });
    await Appointment.create({ startTime: h(14, 0), endTime: h(15, 0), status: 'Booked', MemberId: m4.id, ServiceId: s6.id, StaffId: staff1.id, notes: 'Bloodwork results discussion' });
    await Appointment.create({ startTime: h(15, 0), endTime: h(16, 0), status: 'Booked', MemberId: m5.id, ServiceId: s7.id, StaffId: staff3.id });
    await Appointment.create({ startTime: h(16, 30), endTime: h(17, 30), status: 'Booked', MemberId: m2.id, ServiceId: s4.id, StaffId: staff2.id, notes: 'Post-workout recovery massage' });

    // ORDERS
    await Order.create({ total: 12.50, status: 'Tab', MemberId: m1.id, items: JSON.stringify([{ name: 'Matcha Protein Smoothie', qty: 1, price: 12.50 }]), paymentMethod: 'Tab' });
    await Order.create({ total: 23.50, status: 'Tab', MemberId: m4.id, items: JSON.stringify([{ name: 'Açaí Power Bowl', qty: 1, price: 14.00 }, { name: 'Cold-Pressed Green Juice', qty: 1, price: 9.50 }]), paymentMethod: 'Tab' });
    await Order.create({ total: 218.00, status: 'Paid', MemberId: m2.id, items: JSON.stringify([{ name: 'Tramp Signature Hoodie', qty: 1, price: 180.00 }, { name: 'Magnesium Glycinate', qty: 1, price: 28.00 }, { name: 'Espresso', qty: 2, price: 9.00 }]), paymentMethod: 'Card_Token', chargedAt: new Date() });
    await Order.create({ total: 51.50, status: 'Tab', MemberId: m5.id, items: JSON.stringify([{ name: 'Performance Water Bottle', qty: 1, price: 45.00 }, { name: 'Espresso', qty: 1, price: 4.50 }, { name: 'Cold-Pressed Green Juice', qty: 1, price: 9.50 }]), paymentMethod: 'Tab' });  // dedup: removed extra item and adjusted total logically
    await Order.create({ total: 38.00, status: 'Paid', MemberId: m7.id, items: JSON.stringify([{ name: 'Omega-3 Complex', qty: 1, price: 38.00 }]), paymentMethod: 'Card_Token', chargedAt: new Date() });
    await Order.create({ total: 9.00, status: 'Tab', MemberId: m1.id, items: JSON.stringify([{ name: 'Espresso', qty: 2, price: 9.00 }]), paymentMethod: 'Tab' });

    // MEDICAL RECORDS
    await MedicalRecord.create({ doctorName: 'Dr. Eleanor Voss', summary: 'Annual wellness check. All vitals normal. Recommended increase in vitamin D supplementation.', visitDate: new Date(today.getFullYear(), today.getMonth() - 1, 15), recordType: 'Consultation', MemberId: m1.id });
    await MedicalRecord.create({ doctorName: 'Dr. Eleanor Voss', summary: 'Bloodwork results: cholesterol slightly elevated. Dietary adjustments recommended. Follow-up in 3 months.', visitDate: h(11, 0), recordType: 'Bloodwork', MemberId: m7.id });
    await MedicalRecord.create({ doctorName: 'Dr. Eleanor Voss', summary: 'Initial consultation for membership medical clearance. No contraindications for exercise programme.', visitDate: new Date(today.getFullYear(), today.getMonth() - 2, 5), recordType: 'General', MemberId: m5.id });

    // MEMBER NOTES
    await MemberNote.create({ content: 'Alexandra prefers the 7am Pilates class on Monday/Wednesday/Friday. Always books the same reformer (station 3 by the window).', createdBy: 'James Whitfield', category: 'General', MemberId: m1.id });
    await MemberNote.create({ content: 'VIP shareholder — always offer complimentary post-workout smoothie. Key relationship for corporate tier referrals.', createdBy: 'James Whitfield', category: 'General', MemberId: m1.id });
    await MemberNote.create({ content: 'Mentioned interest in personal training 3x/week programme. Follow up with Marcus re: availability and pricing.', createdBy: 'Sophie Laurent', category: 'Follow_Up', MemberId: m2.id });
    await MemberNote.create({ content: 'Travelling to Milan until late March. Account frozen per her request. Resume billing 1st April.', createdBy: 'Amara Osei', category: 'Billing', MemberId: m6.id });
    await MemberNote.create({ content: 'Slight discomfort reported in right shoulder during last Pilates session. Monitor and recommend physio if it persists.', createdBy: 'Sophie Laurent', category: 'Medical', MemberId: m1.id });
    await MemberNote.create({ content: 'Hugo brought two guests last week for a tour. Both very interested in Founding memberships — follow up this week.', createdBy: 'James Whitfield', category: 'Follow_Up', MemberId: m7.id });

    res.json({ success: true, message: 'Tramp Health Club fully seeded with demo data' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ========== STARTUP ==========
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch(err => console.error('DB sync error:', err));

app.listen(port, () => console.log(`Club OS API running on ${port}`));

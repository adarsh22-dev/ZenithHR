// Vercel Serverless API handler
// NOTE: better-sqlite3 requires a writable filesystem.
// On Vercel, /tmp is the only writable directory.
// For production, replace SQLite with a hosted DB (e.g. Turso, PlanetScale, Neon).

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'zenith_hr_secret_key_12345';

const app = express();
app.use(express.json());

// ---- DB import with /tmp path override for Vercel ----
// better-sqlite3 needs a real writable path on Vercel
process.env.DB_PATH = '/tmp/zenith.db';

// Dynamic import so the DB_PATH env is set before db.ts reads it
let db: any;
let initDb: any;

async function getDb() {
  if (!db) {
    const dbModule = await import('../db.js');
    db = dbModule.default;
    initDb = dbModule.initDb;
    initDb();
  }
  return db;
}

// --- Auth Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Lazy DB middleware: ensures DB is ready before any route ---
app.use(async (req, res, next) => {
  try {
    await getDb();
    next();
  } catch (e: any) {
    res.status(500).json({ message: 'Database unavailable: ' + e.message });
  }
});

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return res.status(400).json({ message: 'User not found' });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, employee_id: user.employee_id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, employee_id: user.employee_id } });
});

// --- Employee Routes ---
app.get('/api/employees', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  let employees;
  if (role === 'admin' || role === 'hr_manager') {
    employees = db.prepare(`SELECT e.*, d.name as department_name, r.name as role_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN roles r ON e.role_id = r.id`).all();
  } else {
    employees = db.prepare(`SELECT e.*, d.name as department_name, r.name as role_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN roles r ON e.role_id = r.id WHERE e.id = ?`).all(employee_id);
  }
  res.json(employees);
});

app.get('/api/employees/:id', authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { role, employee_id } = req.user;
  if (role !== 'admin' && role !== 'hr_manager' && parseInt(id) !== employee_id) return res.sendStatus(403);
  const employee = db.prepare(`SELECT e.*, d.name as department_name, r.name as role_name FROM employees e LEFT JOIN departments d ON e.department_id = d.id LEFT JOIN roles r ON e.role_id = r.id WHERE e.id = ?`).get(id);
  if (!employee) return res.status(404).json({ message: 'Employee not found' });
  res.json(employee);
});

app.put('/api/employees/:id', authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { role, employee_id } = req.user;
  const { phone, work_location, status, first_name, last_name, birthday } = req.body;
  if (!phone || !work_location) return res.status(400).json({ message: 'Phone and work location are required' });
  const isSelf = parseInt(id) === employee_id;
  const isHR = role === 'admin' || role === 'hr_manager';
  if (!isSelf && !isHR) return res.sendStatus(403);
  try {
    if (isHR) {
      db.prepare(`UPDATE employees SET phone = ?, work_location = ?, status = ?, first_name = ?, last_name = ?, birthday = ? WHERE id = ?`).run(phone, work_location, status, first_name, last_name, birthday, id);
    } else {
      db.prepare(`UPDATE employees SET phone = ?, work_location = ?, birthday = ? WHERE id = ?`).run(phone, work_location, birthday, id);
    }
    res.json({ message: 'Profile updated successfully' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  const { first_name, last_name, email, department_id, role_id, status, joining_date, birthday } = req.body;
  if (!first_name || !last_name || !email || !department_id || !role_id || !joining_date) return res.status(400).json({ message: 'All required fields must be filled' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' });
  try {
    const info = db.prepare(`INSERT INTO employees (first_name, last_name, email, department_id, role_id, status, joining_date, birthday, employee_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(first_name, last_name, email, department_id, role_id, status || 'New Hire', joining_date, birthday, `EMP-${Date.now()}`);
    const tempPassword = await bcrypt.hash('welcome123', 10);
    db.prepare('INSERT INTO users (email, password, role, employee_id) VALUES (?, ?, ?, ?)').run(email, tempPassword, 'employee', info.lastInsertRowid);
    db.prepare('INSERT INTO leave_balances (employee_id) VALUES (?)').run(info.lastInsertRowid);
    res.status(201).json({ id: info.lastInsertRowid });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// --- Departments & Roles ---
app.get('/api/departments', authenticateToken, (req, res) => res.json(db.prepare('SELECT * FROM departments').all()));
app.get('/api/roles', authenticateToken, (req, res) => res.json(db.prepare('SELECT * FROM roles').all()));

// --- Attendance ---
app.get('/api/attendance', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const attendance = role === 'admin' || role === 'hr_manager'
    ? db.prepare(`SELECT a.*, e.first_name, e.last_name FROM attendance a JOIN employees e ON a.employee_id = e.id`).all()
    : db.prepare(`SELECT a.*, e.first_name, e.last_name FROM attendance a JOIN employees e ON a.employee_id = e.id WHERE a.employee_id = ?`).all(employee_id);
  res.json(attendance);
});

app.post('/api/attendance/clock-in', authenticateToken, (req: any, res) => {
  const { employee_id } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();
  const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(employee_id, date);
  if (existing) return res.status(400).json({ message: 'Already clocked in today' });
  db.prepare('INSERT INTO attendance (employee_id, date, clock_in, status) VALUES (?, ?, ?, ?)').run(employee_id, date, time, 'Present');
  res.json({ message: 'Clocked in successfully' });
});

app.post('/api/attendance/clock-out', authenticateToken, (req: any, res) => {
  const { employee_id } = req.body;
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString();
  const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(employee_id, date) as any;
  if (!existing) return res.status(400).json({ message: 'Not clocked in today' });
  if (existing.clock_out) return res.status(400).json({ message: 'Already clocked out today' });
  db.prepare('UPDATE attendance SET clock_out = ?, total_hours = ? WHERE id = ?').run(time, 8.5, existing.id);
  res.json({ message: 'Clocked out successfully' });
});

// --- Leaves ---
app.get('/api/leaves', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const leaves = role === 'admin' || role === 'hr_manager'
    ? db.prepare(`SELECT l.*, e.first_name, e.last_name FROM leaves l JOIN employees e ON l.employee_id = e.id`).all()
    : db.prepare(`SELECT l.*, e.first_name, e.last_name FROM leaves l JOIN employees e ON l.employee_id = e.id WHERE l.employee_id = ?`).all(employee_id);
  res.json(leaves);
});

app.post('/api/leaves', authenticateToken, (req, res) => {
  const { employee_id, type, start_date, end_date, reason } = req.body;
  if (!employee_id || !type || !start_date || !end_date) return res.status(400).json({ message: 'All required fields must be filled' });
  try {
    db.prepare(`INSERT INTO leaves (employee_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)`).run(employee_id, type, start_date, end_date, reason);
    res.status(201).json({ message: 'Leave request submitted' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

app.put('/api/leaves/:id/status', authenticateToken, (req: any, res) => {
  const { id } = req.params;
  const { status, approved_by } = req.body;
  try {
    db.prepare('UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?').run(status, approved_by, id);
    res.json({ message: `Leave ${status}` });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// --- Leave Balances ---
app.get('/api/leave-balances', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const balances = role === 'admin' || role === 'hr_manager'
    ? db.prepare(`SELECT lb.*, e.first_name, e.last_name FROM leave_balances lb JOIN employees e ON lb.employee_id = e.id`).all()
    : db.prepare(`SELECT lb.*, e.first_name, e.last_name FROM leave_balances lb JOIN employees e ON lb.employee_id = e.id WHERE lb.employee_id = ?`).all(employee_id);
  res.json(balances);
});

app.put('/api/leave-balances/:employeeId', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
  const { employeeId } = req.params;
  const { annual_total, annual_used, sick_total, sick_used, personal_total, personal_used } = req.body;
  try {
    db.prepare(`UPDATE leave_balances SET annual_total = ?, annual_used = ?, sick_total = ?, sick_used = ?, personal_total = ?, personal_used = ? WHERE employee_id = ?`).run(annual_total, annual_used, sick_total, sick_used, personal_total, personal_used, employeeId);
    res.json({ message: 'Leave balance updated successfully' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// --- Payroll ---
app.get('/api/payroll', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const payroll = role === 'admin' || role === 'hr_manager'
    ? db.prepare(`SELECT p.*, e.first_name, e.last_name FROM payroll p JOIN employees e ON p.employee_id = e.id`).all()
    : db.prepare(`SELECT p.*, e.first_name, e.last_name FROM payroll p JOIN employees e ON p.employee_id = e.id WHERE p.employee_id = ?`).all(employee_id);
  res.json(payroll);
});

// --- Performance ---
app.get('/api/performance', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const reviews = role === 'admin' || role === 'hr_manager'
    ? db.prepare(`SELECT pr.*, e.first_name, e.last_name, r.first_name as reviewer_first_name, r.last_name as reviewer_last_name FROM performance_reviews pr JOIN employees e ON pr.employee_id = e.id JOIN employees r ON pr.reviewer_id = r.id`).all()
    : db.prepare(`SELECT pr.*, e.first_name, e.last_name, r.first_name as reviewer_first_name, r.last_name as reviewer_last_name FROM performance_reviews pr JOIN employees e ON pr.employee_id = e.id JOIN employees r ON pr.reviewer_id = r.id WHERE pr.employee_id = ? OR pr.reviewer_id = ?`).all(employee_id, employee_id);
  res.json(reviews);
});

// --- Work Type Requests ---
app.get('/api/work-type-requests', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const requests = role === 'admin' || role === 'hr_manager'
    ? db.prepare('SELECT w.*, e.first_name, e.last_name FROM work_type_requests w JOIN employees e ON w.employee_id = e.id').all()
    : db.prepare('SELECT w.*, e.first_name, e.last_name FROM work_type_requests w JOIN employees e ON w.employee_id = e.id WHERE w.employee_id = ?').all(employee_id);
  res.json(requests);
});

app.post('/api/work-type-requests', authenticateToken, (req: any, res) => {
  const { employee_id, request_type, reason } = req.body;
  if (!employee_id || !request_type || !reason) return res.status(400).json({ message: 'Request type and reason are required' });
  db.prepare('INSERT INTO work_type_requests (employee_id, request_type, reason) VALUES (?, ?, ?)').run(employee_id, request_type, reason);
  res.status(201).json({ message: 'Request submitted' });
});

// --- Disciplinary Actions ---
app.get('/api/disciplinary-actions', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const actions = role === 'admin' || role === 'hr_manager'
    ? db.prepare('SELECT d.*, e.first_name, e.last_name FROM disciplinary_actions d JOIN employees e ON d.employee_id = e.id').all()
    : db.prepare('SELECT d.*, e.first_name, e.last_name FROM disciplinary_actions d JOIN employees e ON d.employee_id = e.id WHERE d.employee_id = ?').all(employee_id);
  res.json(actions);
});

// --- Policies ---
app.get('/api/policies', authenticateToken, (req, res) => res.json(db.prepare('SELECT * FROM policies').all()));

// --- Movement Register ---
app.get('/api/movement-register', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const movements = role === 'admin' || role === 'hr_manager'
    ? db.prepare('SELECT m.*, e.first_name, e.last_name FROM movement_register m JOIN employees e ON m.employee_id = e.id').all()
    : db.prepare('SELECT m.*, e.first_name, e.last_name FROM movement_register m JOIN employees e ON m.employee_id = e.id WHERE m.employee_id = ?').all(employee_id);
  res.json(movements);
});

app.post('/api/movement-register', authenticateToken, (req: any, res) => {
  const { employee_id, date, purpose, destination, out_time, in_time } = req.body;
  if (!employee_id || !date || !purpose || !destination || !out_time) return res.status(400).json({ message: 'All fields except in-time are required' });
  db.prepare('INSERT INTO movement_register (employee_id, date, purpose, destination, out_time, in_time) VALUES (?, ?, ?, ?, ?, ?)').run(employee_id, date, purpose, destination, out_time, in_time);
  res.status(201).json({ message: 'Movement recorded' });
});

// --- Holidays ---
app.get('/api/holidays', authenticateToken, (req, res) => res.json(db.prepare('SELECT * FROM holidays ORDER BY date ASC').all()));

app.post('/api/holidays', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
  const { name, date, type } = req.body;
  if (!name || !date) return res.status(400).json({ message: 'Name and date are required' });
  try {
    db.prepare('INSERT INTO holidays (name, date, type) VALUES (?, ?, ?)').run(name, date, type || 'Public');
    res.status(201).json({ message: 'Holiday added successfully' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

app.put('/api/holidays/:id', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
  const { id } = req.params;
  const { name, date, type } = req.body;
  if (!name || !date) return res.status(400).json({ message: 'Name and date are required' });
  try {
    db.prepare('UPDATE holidays SET name = ?, date = ?, type = ? WHERE id = ?').run(name, date, type, id);
    res.json({ message: 'Holiday updated successfully' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

app.delete('/api/holidays/:id', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM holidays WHERE id = ?').run(id);
    res.json({ message: 'Holiday deleted successfully' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// --- Help Desk ---
app.get('/api/help-desk', authenticateToken, (req: any, res) => {
  const { role, employee_id } = req.user;
  const tickets = role === 'admin' || role === 'hr_manager'
    ? db.prepare('SELECT t.*, e.first_name, e.last_name FROM help_desk_tickets t JOIN employees e ON t.employee_id = e.id').all()
    : db.prepare('SELECT t.*, e.first_name, e.last_name FROM help_desk_tickets t JOIN employees e ON t.employee_id = e.id WHERE t.employee_id = ?').all(employee_id);
  res.json(tickets);
});

app.post('/api/help-desk', authenticateToken, (req: any, res) => {
  const { employee_id, subject, description, priority } = req.body;
  if (!employee_id || !subject || !description) return res.status(400).json({ message: 'Subject and description are required' });
  db.prepare('INSERT INTO help_desk_tickets (employee_id, subject, description, priority) VALUES (?, ?, ?, ?)').run(employee_id, subject, description, priority || 'Medium');
  res.status(201).json({ message: 'Ticket created' });
});

// --- Permissions ---
app.get('/api/permissions', authenticateToken, (req, res) => {
  const permissions = db.prepare('SELECT * FROM role_permissions').all() as any[];
  const formatted = permissions.reduce((acc: any, curr: any) => {
    acc[curr.role] = JSON.parse(curr.permissions);
    return acc;
  }, {});
  res.json(formatted);
});

app.put('/api/permissions', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  const { role, permissions } = req.body;
  try {
    db.prepare('UPDATE role_permissions SET permissions = ? WHERE role = ?').run(JSON.stringify(permissions), role);
    res.json({ message: 'Permissions updated successfully' });
  } catch (err: any) { res.status(400).json({ message: err.message }); }
});

// --- Stats ---
app.get('/api/stats', authenticateToken, (req, res) => {
  const totalEmployees = db.prepare('SELECT count(*) as count FROM employees').get() as any;
  const activeLeaves = db.prepare("SELECT count(*) as count FROM leaves WHERE status = 'Approved'").get() as any;
  const pendingLeaves = db.prepare("SELECT count(*) as count FROM leaves WHERE status = 'Pending'").get() as any;
  const deptStats = db.prepare(`SELECT d.name, count(e.id) as count FROM departments d LEFT JOIN employees e ON d.id = e.department_id GROUP BY d.id`).all();
  res.json({ totalEmployees: totalEmployees.count, activeLeaves: activeLeaves.count, pendingLeaves: pendingLeaves.count, deptStats });
});

export default app;

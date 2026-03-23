import express from 'express';
import { createServer as createViteServer } from 'vite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db, { initDb } from './db.ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'zenith_hr_secret_key_12345';

const app = express();
app.use(express.json());

async function startServer() {
  initDb();

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

  // --- Auth Routes ---
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    // Server-side validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

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
      employees = db.prepare(`
        SELECT e.*, d.name as department_name, r.name as role_name 
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN roles r ON e.role_id = r.id
      `).all();
    } else {
      employees = db.prepare(`
        SELECT e.*, d.name as department_name, r.name as role_name 
        FROM employees e
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN roles r ON e.role_id = r.id
        WHERE e.id = ?
      `).all(employee_id);
    }
    res.json(employees);
  });

  app.get('/api/employees/:id', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { role, employee_id } = req.user;
    
    // Only allow admin, hr_manager, or the employee themselves to view full profile
    if (role !== 'admin' && role !== 'hr_manager' && parseInt(id) !== employee_id) {
      return res.sendStatus(403);
    }

    const employee = db.prepare(`
      SELECT e.*, d.name as department_name, r.name as role_name 
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE e.id = ?
    `).get(id);
    
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  });

  app.put('/api/employees/:id', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { role, employee_id } = req.user;
    const { phone, work_location, status, first_name, last_name, birthday } = req.body;

    // Server-side validation
    if (!phone || !work_location) {
      return res.status(400).json({ message: 'Phone and work location are required' });
    }

    // Only allow admin, hr_manager to edit status/name. Employees can edit their own phone/location.
    const isSelf = parseInt(id) === employee_id;
    const isHR = role === 'admin' || role === 'hr_manager';

    if (!isSelf && !isHR) {
      return res.sendStatus(403);
    }

    try {
      if (isHR) {
        db.prepare(`
          UPDATE employees 
          SET phone = ?, work_location = ?, status = ?, first_name = ?, last_name = ?, birthday = ?
          WHERE id = ?
        `).run(phone, work_location, status, first_name, last_name, birthday, id);
      } else {
        // Employee can update phone, location and birthday
        db.prepare(`
          UPDATE employees 
          SET phone = ?, work_location = ?, birthday = ?
          WHERE id = ?
        `).run(phone, work_location, birthday, id);
      }
      res.json({ message: 'Profile updated successfully' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.post('/api/employees', authenticateToken, async (req, res) => {
    const { first_name, last_name, email, department_id, role_id, status, joining_date, birthday } = req.body;

    // Server-side validation
    if (!first_name || !last_name || !email || !department_id || !role_id || !joining_date) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(joining_date)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    try {
      const info = db.prepare(`
        INSERT INTO employees (first_name, last_name, email, department_id, role_id, status, joining_date, birthday, employee_code)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(first_name, last_name, email, department_id, role_id, status || 'New Hire', joining_date, birthday, `EMP-${Date.now()}`);
      
      const tempPassword = await bcrypt.hash('welcome123', 10);
      db.prepare('INSERT INTO users (email, password, role, employee_id) VALUES (?, ?, ?, ?)').run(email, tempPassword, 'employee', info.lastInsertRowid);
      
      // Create default leave balance
      db.prepare('INSERT INTO leave_balances (employee_id) VALUES (?)').run(info.lastInsertRowid);

      res.status(201).json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // --- Department & Role Routes ---
  app.get('/api/departments', authenticateToken, (req, res) => {
    const departments = db.prepare('SELECT * FROM departments').all();
    res.json(departments);
  });

  app.get('/api/roles', authenticateToken, (req, res) => {
    const roles = db.prepare('SELECT * FROM roles').all();
    res.json(roles);
  });

  // --- Attendance Routes ---
  app.get('/api/attendance', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let attendance;
    if (role === 'admin' || role === 'hr_manager') {
      attendance = db.prepare(`
        SELECT a.*, e.first_name, e.last_name 
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
      `).all();
    } else {
      attendance = db.prepare(`
        SELECT a.*, e.first_name, e.last_name 
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        WHERE a.employee_id = ?
      `).all(employee_id);
    }
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

    const total_hours = 8.5; 
    db.prepare('UPDATE attendance SET clock_out = ?, total_hours = ? WHERE id = ?').run(time, total_hours, existing.id);
    res.json({ message: 'Clocked out successfully' });
  });

  // --- Leave Routes ---
  app.get('/api/leaves', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let leaves;
    if (role === 'admin' || role === 'hr_manager') {
      leaves = db.prepare(`
        SELECT l.*, e.first_name, e.last_name 
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
      `).all();
    } else {
      leaves = db.prepare(`
        SELECT l.*, e.first_name, e.last_name 
        FROM leaves l
        JOIN employees e ON l.employee_id = e.id
        WHERE l.employee_id = ?
      `).all(employee_id);
    }
    res.json(leaves);
  });

  app.post('/api/leaves', authenticateToken, (req, res) => {
    const { employee_id, type, start_date, end_date, reason } = req.body;

    // Server-side validation
    if (!employee_id || !type || !start_date || !end_date) {
      return res.status(400).json({ message: 'All required fields must be filled' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start_date) || !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    try {
      db.prepare(`
        INSERT INTO leaves (employee_id, type, start_date, end_date, reason)
        VALUES (?, ?, ?, ?, ?)
      `).run(employee_id, type, start_date, end_date, reason);
      res.status(201).json({ message: 'Leave request submitted' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.put('/api/leaves/:id/status', authenticateToken, (req: any, res) => {
    const { id } = req.params;
    const { status, approved_by } = req.body;
    try {
      db.prepare('UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?').run(status, approved_by, id);
      res.json({ message: `Leave ${status}` });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // --- Leave Balance Routes ---
  app.get('/api/leave-balances', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let balances;
    if (role === 'admin' || role === 'hr_manager') {
      balances = db.prepare(`
        SELECT lb.*, e.first_name, e.last_name 
        FROM leave_balances lb
        JOIN employees e ON lb.employee_id = e.id
      `).all();
    } else {
      balances = db.prepare(`
        SELECT lb.*, e.first_name, e.last_name 
        FROM leave_balances lb
        JOIN employees e ON lb.employee_id = e.id
        WHERE lb.employee_id = ?
      `).all(employee_id);
    }
    res.json(balances);
  });

  app.put('/api/leave-balances/:employeeId', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
    const { employeeId } = req.params;
    const { annual_total, annual_used, sick_total, sick_used, personal_total, personal_used } = req.body;

    // Server-side validation
    if (
      annual_total === undefined || annual_used === undefined ||
      sick_total === undefined || sick_used === undefined ||
      personal_total === undefined || personal_used === undefined
    ) {
      return res.status(400).json({ message: 'All balance fields are required' });
    }

    try {
      db.prepare(`
        UPDATE leave_balances 
        SET annual_total = ?, annual_used = ?, sick_total = ?, sick_used = ?, personal_total = ?, personal_used = ?
        WHERE employee_id = ?
      `).run(annual_total, annual_used, sick_total, sick_used, personal_total, personal_used, employeeId);
      res.json({ message: 'Leave balance updated successfully' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // --- Payroll Routes ---
  app.get('/api/payroll', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let payroll;
    if (role === 'admin' || role === 'hr_manager') {
      payroll = db.prepare(`
        SELECT p.*, e.first_name, e.last_name 
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
      `).all();
    } else {
      payroll = db.prepare(`
        SELECT p.*, e.first_name, e.last_name 
        FROM payroll p
        JOIN employees e ON p.employee_id = e.id
        WHERE p.employee_id = ?
      `).all(employee_id);
    }
    res.json(payroll);
  });

  // --- Performance Routes ---
  app.get('/api/performance', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let reviews;
    if (role === 'admin' || role === 'hr_manager') {
      reviews = db.prepare(`
        SELECT pr.*, e.first_name, e.last_name, r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
        FROM performance_reviews pr
        JOIN employees e ON pr.employee_id = e.id
        JOIN employees r ON pr.reviewer_id = r.id
      `).all();
    } else {
      reviews = db.prepare(`
        SELECT pr.*, e.first_name, e.last_name, r.first_name as reviewer_first_name, r.last_name as reviewer_last_name
        FROM performance_reviews pr
        JOIN employees e ON pr.employee_id = e.id
        JOIN employees r ON pr.reviewer_id = r.id
        WHERE pr.employee_id = ? OR pr.reviewer_id = ?
      `).all(employee_id, employee_id);
    }
    res.json(reviews);
  });

  // --- Work Type Requests ---
  app.get('/api/work-type-requests', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let requests;
    if (role === 'admin' || role === 'hr_manager') {
      requests = db.prepare('SELECT w.*, e.first_name, e.last_name FROM work_type_requests w JOIN employees e ON w.employee_id = e.id').all();
    } else {
      requests = db.prepare('SELECT w.*, e.first_name, e.last_name FROM work_type_requests w JOIN employees e ON w.employee_id = e.id WHERE w.employee_id = ?').all(employee_id);
    }
    res.json(requests);
  });

  app.post('/api/work-type-requests', authenticateToken, (req: any, res) => {
    const { employee_id, request_type, reason } = req.body;
    
    // Server-side validation
    if (!employee_id || !request_type || !reason) {
      return res.status(400).json({ message: 'Request type and reason are required' });
    }

    db.prepare('INSERT INTO work_type_requests (employee_id, request_type, reason) VALUES (?, ?, ?)').run(employee_id, request_type, reason);
    res.status(201).json({ message: 'Request submitted' });
  });

  // --- Disciplinary Actions ---
  app.get('/api/disciplinary-actions', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let actions;
    if (role === 'admin' || role === 'hr_manager') {
      actions = db.prepare('SELECT d.*, e.first_name, e.last_name FROM disciplinary_actions d JOIN employees e ON d.employee_id = e.id').all();
    } else {
      actions = db.prepare('SELECT d.*, e.first_name, e.last_name FROM disciplinary_actions d JOIN employees e ON d.employee_id = e.id WHERE d.employee_id = ?').all(employee_id);
    }
    res.json(actions);
  });

  // --- Policies ---
  app.get('/api/policies', authenticateToken, (req, res) => {
    const policies = db.prepare('SELECT * FROM policies').all();
    res.json(policies);
  });

  // --- Movement Register ---
  app.get('/api/movement-register', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let movements;
    if (role === 'admin' || role === 'hr_manager') {
      movements = db.prepare('SELECT m.*, e.first_name, e.last_name FROM movement_register m JOIN employees e ON m.employee_id = e.id').all();
    } else {
      movements = db.prepare('SELECT m.*, e.first_name, e.last_name FROM movement_register m JOIN employees e ON m.employee_id = e.id WHERE m.employee_id = ?').all(employee_id);
    }
    res.json(movements);
  });

  app.post('/api/movement-register', authenticateToken, (req: any, res) => {
    const { employee_id, date, purpose, destination, out_time, in_time } = req.body;

    // Server-side validation
    if (!employee_id || !date || !purpose || !destination || !out_time) {
      return res.status(400).json({ message: 'All fields except in-time are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    db.prepare('INSERT INTO movement_register (employee_id, date, purpose, destination, out_time, in_time) VALUES (?, ?, ?, ?, ?, ?)').run(employee_id, date, purpose, destination, out_time, in_time);
    res.status(201).json({ message: 'Movement recorded' });
  });

  // --- Holidays ---
  app.get('/api/holidays', authenticateToken, (req, res) => {
    const holidays = db.prepare('SELECT * FROM holidays ORDER BY date ASC').all();
    res.json(holidays);
  });

  app.post('/api/holidays', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
    const { name, date, type } = req.body;

    // Server-side validation
    if (!name || !date) {
      return res.status(400).json({ message: 'Name and date are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    try {
      db.prepare('INSERT INTO holidays (name, date, type) VALUES (?, ?, ?)').run(name, date, type || 'Public');
      res.status(201).json({ message: 'Holiday added successfully' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.put('/api/holidays/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
    const { id } = req.params;
    const { name, date, type } = req.body;

    // Server-side validation
    if (!name || !date) {
      return res.status(400).json({ message: 'Name and date are required' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    try {
      db.prepare('UPDATE holidays SET name = ?, date = ?, type = ? WHERE id = ?').run(name, date, type, id);
      res.json({ message: 'Holiday updated successfully' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  app.delete('/api/holidays/:id', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'hr_manager') return res.sendStatus(403);
    const { id } = req.params;
    try {
      db.prepare('DELETE FROM holidays WHERE id = ?').run(id);
      res.json({ message: 'Holiday deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // --- Help Desk ---
  app.get('/api/help-desk', authenticateToken, (req: any, res) => {
    const { role, employee_id } = req.user;
    let tickets;
    if (role === 'admin' || role === 'hr_manager') {
      tickets = db.prepare('SELECT t.*, e.first_name, e.last_name FROM help_desk_tickets t JOIN employees e ON t.employee_id = e.id').all();
    } else {
      tickets = db.prepare('SELECT t.*, e.first_name, e.last_name FROM help_desk_tickets t JOIN employees e ON t.employee_id = e.id WHERE t.employee_id = ?').all(employee_id);
    }
    res.json(tickets);
  });

  app.post('/api/help-desk', authenticateToken, (req: any, res) => {
    const { employee_id, subject, description, priority } = req.body;

    // Server-side validation
    if (!employee_id || !subject || !description) {
      return res.status(400).json({ message: 'Subject and description are required' });
    }

    db.prepare('INSERT INTO help_desk_tickets (employee_id, subject, description, priority) VALUES (?, ?, ?, ?)').run(employee_id, subject, description, priority || 'Medium');
    res.status(201).json({ message: 'Ticket created' });
  });

  // --- Role Permissions Routes ---
  app.get('/api/permissions', authenticateToken, (req, res) => {
    const permissions = db.prepare('SELECT * FROM role_permissions').all() as any[];
    const formatted = permissions.reduce((acc, curr) => {
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
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  });

  // --- Stats ---
  app.get('/api/stats', authenticateToken, (req, res) => {
    const totalEmployees = db.prepare('SELECT count(*) as count FROM employees').get() as any;
    const activeLeaves = db.prepare("SELECT count(*) as count FROM leaves WHERE status = 'Approved'").get() as any;
    const pendingLeaves = db.prepare("SELECT count(*) as count FROM leaves WHERE status = 'Pending'").get() as any;
    const deptStats = db.prepare(`
        SELECT d.name, count(e.id) as count 
        FROM departments d 
        LEFT JOIN employees e ON d.id = e.department_id 
        GROUP BY d.id
    `).all();

    res.json({
      totalEmployees: totalEmployees.count,
      activeLeaves: activeLeaves.count,
      pendingLeaves: pendingLeaves.count,
      deptStats
    });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => res.sendFile(path.resolve('dist', 'index.html')));
  }

  if (process.env.VERCEL !== '1') {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;

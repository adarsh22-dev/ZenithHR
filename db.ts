import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

const dbPath = process.env.DB_PATH || 'zenith_hr.db';
const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      permissions TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'employee',
      employee_id INTEGER,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS employees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      employee_code TEXT UNIQUE,
      department_id INTEGER,
      role_id INTEGER,
      manager_id INTEGER,
      status TEXT DEFAULT 'Active',
      joining_date TEXT,
      birthday TEXT,
      salary_structure TEXT,
      work_location TEXT,
      contract_type TEXT,
      avatar_url TEXT,
      FOREIGN KEY (department_id) REFERENCES departments(id),
      FOREIGN KEY (role_id) REFERENCES roles(id),
      FOREIGN KEY (manager_id) REFERENCES employees(id)
    );

    -- Add birthday column if it doesn't exist (for existing databases)
    PRAGMA table_info(employees);
  `);

  try {
    db.exec('ALTER TABLE employees ADD COLUMN birthday TEXT');
  } catch (e) {
    // Column might already exist, ignore error
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      clock_in TEXT,
      clock_out TEXT,
      status TEXT,
      total_hours REAL,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS breaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attendance_id INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT,
      duration INTEGER,
      FOREIGN KEY (attendance_id) REFERENCES attendance(id)
    );

    CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      approved_by INTEGER,
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (approved_by) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS payroll (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      basic_salary REAL NOT NULL,
      bonuses REAL DEFAULT 0,
      deductions REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      net_salary REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS performance_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      reviewer_id INTEGER NOT NULL,
      review_date TEXT NOT NULL,
      period TEXT NOT NULL,
      kpi_score INTEGER,
      feedback TEXT,
      self_review TEXT,
      status TEXT DEFAULT 'Pending Self-Review',
      FOREIGN KEY (employee_id) REFERENCES employees(id),
      FOREIGN KEY (reviewer_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS work_type_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      request_type TEXT NOT NULL, -- Remote, Hybrid, On-site Change
      reason TEXT,
      status TEXT DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS disciplinary_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      action_type TEXT NOT NULL, -- Warning, Suspension, etc.
      description TEXT,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS policies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT,
      effective_date TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS movement_register (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      purpose TEXT,
      destination TEXT,
      out_time TEXT,
      in_time TEXT,
      status TEXT DEFAULT 'Pending',
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS holidays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT DEFAULT 'Public' -- Public, Optional
    );

    CREATE TABLE IF NOT EXISTS help_desk_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
      status TEXT DEFAULT 'Open', -- Open, In Progress, Resolved, Closed
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employee_id INTEGER NOT NULL UNIQUE,
      annual_total INTEGER DEFAULT 20,
      annual_used INTEGER DEFAULT 0,
      sick_total INTEGER DEFAULT 10,
      sick_used INTEGER DEFAULT 0,
      personal_total INTEGER DEFAULT 5,
      personal_used INTEGER DEFAULT 0,
      FOREIGN KEY (employee_id) REFERENCES employees(id)
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role TEXT PRIMARY KEY,
      permissions TEXT NOT NULL
    );
  `);

  // Seed initial data
  const deptCount = db.prepare('SELECT count(*) as count FROM departments').get() as { count: number };
  if (deptCount.count === 0) {
    const engId = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)').run('Engineering', 'Software development and infrastructure').lastInsertRowid;
    const hrId = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)').run('Human Resources', 'People and culture').lastInsertRowid;
    const mktId = db.prepare('INSERT INTO departments (name, description) VALUES (?, ?)').run('Marketing', 'Brand and growth').lastInsertRowid;
    
    const adminRoleId = db.prepare('INSERT INTO roles (name, permissions) VALUES (?, ?)').run('Admin', 'all').lastInsertRowid;
    const hrRoleId = db.prepare('INSERT INTO roles (name, permissions) VALUES (?, ?)').run('HR Manager', 'hr_access').lastInsertRowid;
    const empRoleId = db.prepare('INSERT INTO roles (name, permissions) VALUES (?, ?)').run('Employee', 'self_access').lastInsertRowid;

    // Seed Role Permissions
    const defaultPermissions = {
      admin: {
        Employees: { read: true, write: true, delete: true },
        Attendance: { read: true, write: true, delete: true },
        Leaves: { read: true, write: true, delete: true },
        Payroll: { read: true, write: true, delete: true },
        Performance: { read: true, write: true, delete: true },
        Reports: { read: true, write: true, delete: true },
      },
      hr_manager: {
        Employees: { read: true, write: true, delete: false },
        Attendance: { read: true, write: true, delete: false },
        Leaves: { read: true, write: true, delete: false },
        Payroll: { read: true, write: true, delete: false },
        Performance: { read: true, write: true, delete: false },
        Reports: { read: true, write: false, delete: false },
      },
      employee: {
        Employees: { read: true, write: false, delete: false },
        Attendance: { read: true, write: true, delete: false },
        Leaves: { read: true, write: true, delete: false },
        Payroll: { read: true, write: false, delete: false },
        Performance: { read: true, write: false, delete: false },
        Reports: { read: false, write: false, delete: false },
      }
    };

    const stmt = db.prepare('INSERT INTO role_permissions (role, permissions) VALUES (?, ?)');
    Object.entries(defaultPermissions).forEach(([role, perms]) => {
      stmt.run(role, JSON.stringify(perms));
    });

    const adminPassword = bcrypt.hashSync('admin123', 10);
    const adminEmpId = db.prepare(`
      INSERT INTO employees (first_name, last_name, email, department_id, role_id, status, joining_date, employee_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('System', 'Admin', 'admin@zenithhr.com', hrId, adminRoleId, 'Active', '2024-01-01', 'EMP-001').lastInsertRowid;

    db.prepare('INSERT INTO users (email, password, role, employee_id) VALUES (?, ?, ?, ?)').run('admin@zenithhr.com', adminPassword, 'admin', adminEmpId);

    const empPassword = bcrypt.hashSync('welcome123', 10);
    const emp1Id = db.prepare(`
      INSERT INTO employees (first_name, last_name, email, department_id, role_id, status, joining_date, employee_code, manager_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('Sarah', 'Connor', 'sarah@zenithhr.com', engId, empRoleId, 'Active', '2024-02-15', 'EMP-002', adminEmpId).lastInsertRowid;

    db.prepare('INSERT INTO users (email, password, role, employee_id) VALUES (?, ?, ?, ?)').run('sarah@zenithhr.com', empPassword, 'employee', emp1Id);

    // Seed leave balances
    db.prepare('INSERT OR IGNORE INTO leave_balances (employee_id, annual_total, annual_used, sick_total, sick_used) VALUES (?, ?, ?, ?, ?)').run(adminEmpId, 25, 2, 12, 1);
    db.prepare('INSERT OR IGNORE INTO leave_balances (employee_id, annual_total, annual_used, sick_total, sick_used) VALUES (?, ?, ?, ?, ?)').run(emp1Id, 20, 5, 10, 2);

    // Seed additional data
    db.prepare("INSERT INTO work_type_requests (employee_id, request_type, reason, status) VALUES (?, ?, ?, ?)").run(emp1Id, 'Remote', 'Need to work from home for personal reasons.', 'Approved');
    db.prepare("INSERT INTO work_type_requests (employee_id, request_type, reason, status) VALUES (?, ?, ?, ?)").run(emp1Id, 'Hybrid', 'Prefer coming to office twice a week.', 'Pending');

    db.prepare("INSERT INTO disciplinary_actions (employee_id, action_type, description, date, status) VALUES (?, ?, ?, ?, ?)").run(emp1Id, 'Warning', 'Late for meetings multiple times.', '2024-02-15', 'Active');

    db.prepare("INSERT INTO policies (title, content, category, effective_date) VALUES (?, ?, ?, ?)").run('Remote Work Policy', 'Employees can work remotely up to 3 days a week...', 'Work Arrangement', '2024-01-01');
    db.prepare("INSERT INTO policies (title, content, category, effective_date) VALUES (?, ?, ?, ?)").run('Code of Conduct', 'Professional behavior is expected at all times...', 'General', '2024-01-01');

    db.prepare("INSERT INTO holidays (name, date, type) VALUES (?, ?, ?)").run('New Year\'s Day', '2024-01-01', 'Public');
    db.prepare("INSERT INTO holidays (name, date, type) VALUES (?, ?, ?)").run('Independence Day', '2024-07-04', 'Public');
    db.prepare("INSERT INTO holidays (name, date, type) VALUES (?, ?, ?)").run('Christmas Day', '2024-12-25', 'Public');
    db.prepare("INSERT INTO holidays (name, date, type) VALUES (?, ?, ?)").run('Company Foundation Day', '2024-05-15', 'Optional');

    db.prepare("INSERT INTO help_desk_tickets (employee_id, subject, description, priority, status) VALUES (?, ?, ?, ?, ?)").run(emp1Id, 'Laptop Issue', 'My laptop is overheating.', 'High', 'Open');
    db.prepare("INSERT INTO help_desk_tickets (employee_id, subject, description, priority, status) VALUES (?, ?, ?, ?, ?)").run(emp1Id, 'VPN Access', 'Need VPN access for remote work.', 'Medium', 'Resolved');
  }
}

export default db;

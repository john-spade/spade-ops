-- Seed Admin Employee
INSERT INTO employees (user_id, employee_id, first_name, last_name, email, position, department, status, date_hired)
SELECT id, 'EMP-001', 'Admin', 'John', 'admin-john@spadesecurity.com', 'Administrator', 'Management', 'active', CURDATE()
FROM users WHERE email = 'admin-john@spadesecurity.com';

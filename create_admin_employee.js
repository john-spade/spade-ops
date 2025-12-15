
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function setupAdminEmployee() {
    const baseUrl = 'https://spade-ops.onrender.com/api';
    const email = 'admin-john@spadesecurity.com';
    const password = '912610jc';

    for (let i = 0; i < 10; i++) {
        console.log(`Attempt ${i + 1}/10...`);
        try {
            // 1. Login
            const loginRes = await fetch(`${baseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: email, password })
            });

            const loginData = await loginRes.json();
            if (!loginData.success) {
                console.log('Login failed (server might be restarting):', loginData.message);
                await sleep(10000);
                continue;
            }

            const token = loginData.data.token;

            // 2. Create Employee
            const empRes = await fetch(`${baseUrl}/employees`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    first_name: 'Admin',
                    last_name: 'John',
                    email: email,
                    employee_id: 'ADMIN-001',
                    position: 'System Administrator',
                    department: 'Management',
                    date_hired: new Date().toISOString().split('T')[0],
                    status: 'active'
                })
            });

            const empData = await empRes.json();

            if (empData.success) {
                console.log('SUCCESS! Employee record created:', empData);
                return;
            } else if (empData.message === 'Email already exists') {
                console.log('Deployment not ready yet (Old code active). Waiting 20s...');
                await sleep(20000);
            } else {
                console.log('Other error:', empData);
                // If it says "Employee ID already exists", we are effectively done too
                if (empData.message === 'Employee ID already exists') {
                    console.log('Admin employee already exists! We are good.');
                    return;
                }
                return;
            }

        } catch (error) {
            console.error('Network error (server might be down):', error.message);
            await sleep(10000);
        }
    }
}

setupAdminEmployee();

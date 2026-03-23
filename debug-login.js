// debug-login.js  ← create this in mhomes-resort/
const axios = require('axios');

async function debugLogin() {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
        email: 'test7@gmail.com',
        password: 'test@mhomes',
    });

    console.log('Status:', res.status);
    console.log('Headers:', res.headers['set-cookie']);
    console.log('Body:', JSON.stringify(res.data, null, 2));
}

debugLogin().catch(err => {
    console.error('Failed:', err.response?.status, err.response?.data);
});
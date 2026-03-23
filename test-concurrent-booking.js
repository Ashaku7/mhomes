// test-concurrent-booking.js
// Run from project root: node test-concurrent-booking.js
// Backend must be running on localhost:5000

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// ─── CONFIG ───────────────────────────────────────────────
const USER1_EMAIL = 'test7@gmail.com';
const USER1_PASSWORD = 'test@mhomes';
const USER2_EMAIL = 'test8@gmail.com';
const USER2_PASSWORD = 'test@mhomes';

const ROOM_101_ID = 3;

const SAME_CHECKIN = '2026-09-01';
const SAME_CHECKOUT = '2026-09-04';

const OVERLAP_CHECKIN_A = '2026-09-10';
const OVERLAP_CHECKOUT_A = '2026-09-14';
const OVERLAP_CHECKIN_B = '2026-09-12';
const OVERLAP_CHECKOUT_B = '2026-09-16';

const BOOKING_SOURCE = 'online';
// ──────────────────────────────────────────────────────────

async function loginOnly(email, password) {
    const res = await axios.post(`${BASE_URL}/auth/login`, { email, password });
    const token = res.data?.data?.token;
    if (!token) throw new Error(`Login failed for ${email} — no token in response`);
    console.log(`  🔑 Logged in as ${email}`);
    return token;
}

async function getAdminToken() {
    const res = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@mhomes.in',
        password: 'Admin@123',
    });
    return res.data?.data?.token;
}

async function cancelTestBookings(adminToken, datePrefix) {
    try {
        const res = await axios.get(`${BASE_URL}/admin/bookings`, {
            headers: { Authorization: `Bearer ${adminToken}` },
        });
        const bookings = res.data.data?.bookings ?? [];
        const toCancel = bookings.filter(
            b => b.checkIn?.startsWith(datePrefix) && b.bookingStatus !== 'cancelled'
        );
        for (const b of toCancel) {
            await axios.patch(
                `${BASE_URL}/admin/bookings/${b.id}/cancel`,
                {},
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );
        }
        if (toCancel.length) {
            console.log(`  🧹 Cancelled ${toCancel.length} test booking(s)\n`);
        }
    } catch (e) {
        console.warn('  ⚠️  Cleanup failed:', e.message);
    }
}

async function fireTwoRequests(label, payloadA, tokenA, payloadB, tokenB) {
    console.log(`\n${'═'.repeat(58)}`);
    console.log(`🧪  ${label}`);
    console.log('═'.repeat(58));
    console.log(`  User1: ${payloadA.checkIn} → ${payloadA.checkOut}`);
    console.log(`  User2: ${payloadB.checkIn} → ${payloadB.checkOut}`);
    console.log('  Firing both at the exact same time...\n');

    const req = (payload, token, userName) =>
        axios
            .post(`${BASE_URL}/bookings`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then(res => ({
                user: userName,
                status: 'SUCCESS',
                bookingId: res.data.data?.booking?.id,
            }))
            .catch(err => ({
                user: userName,
                status: 'BLOCKED',
                message: err.response?.data?.message ?? err.message,
                httpStatus: err.response?.status,
            }));

    const [r1, r2] = await Promise.all([
        req(payloadA, tokenA, 'User1 (Alice)'),
        req(payloadB, tokenB, 'User2 (Bob)'),
    ]);

    [r1, r2].forEach(r => {
        if (r.status === 'SUCCESS') {
            console.log(`  ✅ ${r.user}: BOOKED — Booking ID #${r.bookingId}`);
        } else {
            console.log(`  ❌ ${r.user}: BLOCKED — "${r.message}" (HTTP ${r.httpStatus})`);
        }
    });

    const successes = [r1, r2].filter(r => r.status === 'SUCCESS').length;
    console.log('');
    if (successes === 1) {
        console.log('  🎯 PASS — Only 1 booking went through. Lock works correctly.');
    } else if (successes === 2) {
        console.log('  🚨 FAIL — Both went through! Double booking detected!');
    } else {
        console.log('  ⚠️  WARN — Both failed. Check auth or existing bookings.');
    }

    return [r1, r2];
}

// ─── MAIN ─────────────────────────────────────────────────

async function runTests() {
    console.log('\n🏨  MHomes Concurrent Booking Test');
    console.log('    2 users | JWT auth | Room 101\n');

    console.log('── Setup ─────────────────────────────────────────────');
    const [token1, token2, adminToken] = await Promise.all([
        loginOnly(USER1_EMAIL, USER1_PASSWORD),
        loginOnly(USER2_EMAIL, USER2_PASSWORD),
        getAdminToken(),
    ]);

    // ── TEST 1: Same room, exact same dates ───────────────
    await cancelTestBookings(adminToken, '2026-09-01');

    await fireTwoRequests(
        'TEST 1 — Same room, exact same dates',
        {
            checkIn: SAME_CHECKIN,
            checkOut: SAME_CHECKOUT,
            roomIds: [ROOM_101_ID],
            totalGuests: 1,
            fullName: 'Alice Test',
            phone: '9000000001',
            email: USER1_EMAIL,
            bookingSource: 'online',
        },
        token1,
        {
            checkIn: SAME_CHECKIN,
            checkOut: SAME_CHECKOUT,
            roomIds: [ROOM_101_ID],
            totalGuests: 1,
            fullName: 'Bob Test',
            phone: '9000000002',
            email: USER2_EMAIL,
            bookingSource: 'online',
        },
        token2,
    );

    await cancelTestBookings(adminToken, '2026-09-01');

    // ── TEST 2: Same room, overlapping dates ──────────────
    await cancelTestBookings(adminToken, '2026-09-1');

    await fireTwoRequests(
        'TEST 2 — Same room, overlapping dates',
        {
            checkIn: OVERLAP_CHECKIN_A,
            checkOut: OVERLAP_CHECKOUT_A,
            roomIds: [ROOM_101_ID],
            totalGuests: 1,
            fullName: 'Alice Test',
            phone: '9000000001',
            email: USER1_EMAIL,
            bookingSource: 'online',
        },
        token1,
        {
            checkIn: OVERLAP_CHECKIN_B,
            checkOut: OVERLAP_CHECKOUT_B,
            roomIds: [ROOM_101_ID],
            totalGuests: 1,
            fullName: 'Bob Test',
            phone: '9000000002',
            email: USER2_EMAIL,
            bookingSource: 'online',
        },
        token2,
    );

    await cancelTestBookings(adminToken, '2026-09-1');

    // ── Summary ───────────────────────────────────────────
    console.log(`\n${'═'.repeat(58)}`);
    console.log('  Done. Two tests ran:');
    console.log('  T1 — Same dates:        1 pass expected');
    console.log('  T2 — Overlapping dates: 1 pass expected');
    console.log('  If both show 🎯 PASS, your locking is solid.');
    console.log(`${'═'.repeat(58)}\n`);
}

runTests().catch(err => {
    console.error('\n💥 Test crashed:', err.message);
    process.exit(1);
});
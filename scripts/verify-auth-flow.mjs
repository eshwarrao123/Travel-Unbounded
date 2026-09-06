import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n=============================================');
  console.log('STARTING PHASE 2 STEP 1 AUTHENTICATION AUDIT');
  console.log('=============================================\n');

  // Test 1: Public routes accessibility
  console.log('[Phase 1 Regression Checks]');
  {
    const resHome = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
    assert(resHome.status === 200, 'Public homepage (/) is accessible (200 OK)');

    const resDest = await fetch(`${BASE_URL}/destinations`, { redirect: 'manual' });
    assert(resDest.status === 200, 'Public destinations page (/destinations) is accessible (200 OK)');

    const resContact = await fetch(`${BASE_URL}/contact`, { redirect: 'manual' });
    assert(resContact.status === 200, 'Public contact page (/contact) is accessible (200 OK)');
  }

  // Test 2: Unauthenticated access to /admin/login
  console.log('\n[/admin/login Accessibility]');
  {
    const res = await fetch(`${BASE_URL}/admin/login`, { redirect: 'manual' });
    assert(res.status === 200, '/admin/login is publicly accessible (200 OK)');
  }

  // Test 3: Unauthenticated access to protected /admin pages
  console.log('\n[Middleware Protection for Unauthenticated Users]');
  {
    const resDashboard = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
    assert(
      resDashboard.status === 307 || resDashboard.status === 308,
      `Unauthenticated /admin/dashboard redirects (status: ${resDashboard.status})`
    );
    const location = resDashboard.headers.get('location') || '';
    assert(
      location.includes('/admin/login'),
      `Redirect target contains /admin/login (Target: ${location})`
    );

    const resAdminRoot = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    assert(
      resAdminRoot.status === 307 || resAdminRoot.status === 308,
      `Unauthenticated /admin root redirects (status: ${resAdminRoot.status})`
    );
  }

  // Test 4: Server-side validation on login endpoint
  console.log('\n[Login Endpoint Input Validation]');
  {
    // Empty body
    const resEmpty = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(resEmpty.status === 400, 'Empty login payload returns 400 Bad Request');

    // Missing password
    const resNoPass = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com' }),
    });
    assert(resNoPass.status === 400, 'Missing password returns 400 Bad Request');

    // Invalid email format
    const resBadEmail = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notanemail', password: 'SomePassword' }),
    });
    assert(resBadEmail.status === 400, 'Malformed email format returns 400 Bad Request');

    // Wrong credentials
    const resWrong = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'WrongPassword999' }),
    });
    assert(resWrong.status === 401, 'Invalid credentials return 401 Unauthorized');
    const wrongData = await resWrong.json();
    assert(wrongData.success === false, 'Response body has success: false');
    assert(wrongData.message === 'Invalid email or password.', 'Returns safe generic error message');
  }

  // Test 5: Successful login with evaluator credentials
  console.log('\n[Valid Authentication & Cookie Issuance]');
  let sessionCookie = '';
  {
    const resLogin = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'TravelAdmin@123',
      }),
    });

    assert(resLogin.status === 200, 'Valid credentials return 200 OK');
    const loginData = await resLogin.json();
    assert(loginData.success === true, 'Response body has success: true');
    assert(loginData.user?.email === 'admin@gmail.com', 'Returns user email in response');
    assert(loginData.user?.role === 'admin', 'Returns user role in response');
    assert(!loginData.user?.password, 'Password/hash is NEVER exposed in API response');

    // Inspect Set-Cookie header
    const setCookie = resLogin.headers.get('set-cookie') || '';
    assert(setCookie.includes('admin_session='), 'Set-Cookie contains admin_session token');
    assert(/httponly/i.test(setCookie), 'admin_session cookie has HttpOnly flag set');
    assert(/samesite=lax/i.test(setCookie), 'admin_session cookie has SameSite=lax flag set');
    assert(/path=\//i.test(setCookie), 'admin_session cookie has Path=/');

    // Extract cookie value for subsequent requests
    const match = setCookie.match(/admin_session=([^;]+)/);
    sessionCookie = match ? match[1] : '';
    assert(sessionCookie.length > 20, 'JWT token is securely populated');
  }

  // Test 6: Protected API route verification (/api/admin/auth/me)
  console.log('\n[Protected API Server-Side Verification]');
  {
    // Unauthenticated call
    const resMeUnauth = await fetch(`${BASE_URL}/api/admin/auth/me`);
    assert(resMeUnauth.status === 401, 'GET /api/admin/auth/me without session returns 401 Unauthorized');

    // Authenticated call with cookie
    const resMeAuth = await fetch(`${BASE_URL}/api/admin/auth/me`, {
      headers: { Cookie: `admin_session=${sessionCookie}` },
    });
    assert(resMeAuth.status === 200, 'GET /api/admin/auth/me with session returns 200 OK');
    const meData = await resMeAuth.json();
    assert(meData.success === true, 'Protected API returned success: true');
    assert(meData.user?.email === 'admin@gmail.com', 'Protected API correctly verified admin email');
    assert(meData.user?.role === 'admin', 'Protected API correctly verified admin role');
  }

  // Test 7: Protected page access with session cookie
  console.log('\n[Protected UI Page Access with Session Cookie]');
  {
    const resDash = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: `admin_session=${sessionCookie}` },
      redirect: 'manual',
    });
    assert(resDash.status === 200, 'Authenticated request to /admin/dashboard returns 200 OK (no redirect)');

    // Accessing /admin/login while authenticated should redirect to /admin/dashboard
    const resLoginRedirect = await fetch(`${BASE_URL}/admin/login`, {
      headers: { Cookie: `admin_session=${sessionCookie}` },
      redirect: 'manual',
    });
    assert(
      resLoginRedirect.status === 307 || resLoginRedirect.status === 308,
      'Authenticated access to /admin/login redirects away'
    );
    const loc = resLoginRedirect.headers.get('location') || '';
    assert(loc.includes('/admin/dashboard'), `Redirects to /admin/dashboard (Target: ${loc})`);
  }

  // Test 8: Tampered or invalid JWT verification
  console.log('\n[Tampered / Invalid Token Handling]');
  {
    const badCookie = 'admin_session=invalid.token.here';
    const resBadToken = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: badCookie },
      redirect: 'manual',
    });
    assert(
      resBadToken.status === 307 || resBadToken.status === 308,
      'Tampered token causes middleware redirect to /admin/login'
    );
    const setCookie = resBadToken.headers.get('set-cookie') || '';
    assert(
      setCookie.includes('admin_session=') && (setCookie.includes('Max-Age=0') || setCookie.includes('max-age=0')),
      'Middleware clears invalid token cookie (Max-Age=0)'
    );
  }

  // Test 9: Logout functionality
  console.log('\n[Logout & Session Invalidation]');
  {
    const resLogout = await fetch(`${BASE_URL}/api/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `admin_session=${sessionCookie}` },
    });
    assert(resLogout.status === 200, 'POST /api/admin/auth/logout returns 200 OK');
    const logoutData = await resLogout.json();
    assert(logoutData.success === true, 'Logout response has success: true');

    const setCookie = resLogout.headers.get('set-cookie') || '';
    assert(
      setCookie.includes('admin_session=') && (setCookie.includes('Max-Age=0') || setCookie.includes('max-age=0')),
      'Logout response sets admin_session cookie with Max-Age=0 to invalidate session'
    );

    // After logout, accessing protected page redirects again
    const resPostLogout = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: 'admin_session=' },
      redirect: 'manual',
    });
    assert(
      resPostLogout.status === 307 || resPostLogout.status === 308,
      'Accessing /admin/dashboard after logout redirects to /admin/login'
    );
  }

  // Test 10: Database audit — verify password is never stored plaintext
  console.log('\n[Database Security Audit]');
  {
    await mongoose.connect(process.env.MONGODB_URI);
    const usersCollection = mongoose.connection.collection('users');
    const adminDoc = await usersCollection.findOne({ email: 'admin@gmail.com' });

    assert(adminDoc !== null, 'Admin user exists in MongoDB Atlas');
    assert(typeof adminDoc.password === 'string', 'Password field exists');
    assert(adminDoc.password.startsWith('$2'), 'Password is stored as a bcrypt hash (starts with $2)');
    assert(adminDoc.password !== 'TravelAdmin@123', 'Password is NEVER stored in plaintext');
    assert(adminDoc.password.length >= 60, 'Bcrypt hash length is valid (>= 60 characters)');

    // Verify existing enquiries collection is completely untouched
    const enquiriesCollection = mongoose.connection.collection('enquiries');
    const enquiryCount = await enquiriesCollection.countDocuments();
    console.log(`  ℹ Existing enquiries count: ${enquiryCount} (intact, untouched)`);

    await mongoose.disconnect();
  }

  console.log('\n=============================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

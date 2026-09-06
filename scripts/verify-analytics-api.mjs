import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

// 1. Load .env.local
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

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';
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
  console.log('\n======================================================');
  console.log('STARTING PHASE 2 STEP 7: ANALYTICS BACKEND & API AUDIT');
  console.log('======================================================\n');

  let adminCookie = '';

  // ---------------------------------------------------------
  // SECTION 1: AUTHENTICATION ENFORCEMENT
  // ---------------------------------------------------------
  console.log('[1. Authentication Enforcement on GET /api/analytics/summary]');
  {
    // Test 1.1: Unauthenticated request
    const resUnauth = await fetch(`${BASE_URL}/api/analytics/summary`);
    assert(resUnauth.status === 401, 'GET /api/analytics/summary without session returns 401 Unauthorized');
    const unauthJson = await resUnauth.json();
    assert(unauthJson.success === false, 'Unauthenticated response has success: false');
    assert(unauthJson.error?.code === 'UNAUTHORIZED', 'Error code is "UNAUTHORIZED"');

    // Test 1.2: Tampered/invalid session token
    const resBadToken = await fetch(`${BASE_URL}/api/analytics/summary`, {
      headers: { Cookie: 'admin_session=invalid.tampered.token' },
    });
    assert(resBadToken.status === 401, 'GET /api/analytics/summary with invalid token returns 401 Unauthorized');

    // Test 1.3: Admin login to obtain session cookie
    const resLogin = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'TravelAdmin@123',
      }),
    });
    assert(resLogin.status === 200, 'Admin login succeeds with 200 OK');
    const cookieHeader = resLogin.headers.get('set-cookie') || '';
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    adminCookie = match ? match[1] : '';
    assert(adminCookie.length > 20, 'Admin session cookie successfully retrieved for audit');
  }

  // ---------------------------------------------------------
  // SECTION 2: CANONICAL API CONTRACT & RESPONSE STRUCTURE
  // ---------------------------------------------------------
  console.log('\n[2. Canonical API Response Envelope & Contract]');
  let analyticsData;
  {
    const res = await fetch(`${BASE_URL}/api/analytics/summary`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });

    assert(res.status === 200, 'GET /api/analytics/summary returns 200 OK with valid admin session');
    const json = await res.json();

    assert(json.success === true, 'Response envelope has success: true');
    assert(typeof json.data === 'object' && json.data !== null, 'Response has data object');
    assert(typeof json.data.overview === 'object', 'data.overview is an object');
    assert(Array.isArray(json.data.monthlyVolume), 'data.monthlyVolume is an array');
    assert(Array.isArray(json.data.statusBreakdown), 'data.statusBreakdown is an array');
    assert(Array.isArray(json.data.topDestinations), 'data.topDestinations is an array');
    assert(typeof json.data.destinationTrackingAvailable === 'boolean', 'destinationTrackingAvailable is a boolean');

    analyticsData = json.data;
  }

  // ---------------------------------------------------------
  // SECTION 3: DIRECT MONGODB PERSISTENCE VERIFICATION
  // ---------------------------------------------------------
  console.log('\n[3. Cross-Verification with MongoDB Persisted Data]');
  {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection;

    // 3.1: Verify totalLeads matches actual enquiry count
    const actualTotalEnquiries = await db.collection('enquiries').countDocuments();
    assert(
      analyticsData.overview.totalLeads === actualTotalEnquiries,
      `overview.totalLeads (${analyticsData.overview.totalLeads}) matches MongoDB enquiries count (${actualTotalEnquiries})`
    );

    // 3.2: Verify activeDestinations matches actual destination count
    const actualTotalDestinations = await db.collection('destinations').countDocuments();
    assert(
      analyticsData.overview.activeDestinations === actualTotalDestinations,
      `overview.activeDestinations (${analyticsData.overview.activeDestinations}) matches MongoDB destinations count (${actualTotalDestinations})`
    );

    // 3.3: Verify convertedLeads matches actual converted count
    const actualConvertedCount = await db.collection('enquiries').countDocuments({ status: 'Converted' });
    assert(
      analyticsData.overview.convertedLeads === actualConvertedCount,
      `overview.convertedLeads (${analyticsData.overview.convertedLeads}) matches MongoDB converted count (${actualConvertedCount})`
    );

    // 3.4: Verify conversion rate calculation
    const expectedConversionRate =
      actualTotalEnquiries > 0
        ? Number(((actualConvertedCount / actualTotalEnquiries) * 100).toFixed(1))
        : 0;
    assert(
      analyticsData.overview.conversionRate === expectedConversionRate,
      `overview.conversionRate (${analyticsData.overview.conversionRate}%) matches expected mathematical rate (${expectedConversionRate}%)`
    );
    assert(!isNaN(analyticsData.overview.conversionRate), 'Conversion rate is not NaN');

    // ---------------------------------------------------------
    // SECTION 4: STATUS BREAKDOWN ACCURACY
    // ---------------------------------------------------------
    console.log('\n[4. Status Breakdown Distribution & Sum Consistency]');
    const expectedStatuses = ['New', 'Contacted', 'Converted', 'Closed'];
    assert(
      analyticsData.statusBreakdown.length === 4,
      'statusBreakdown contains exactly 4 lifecycle statuses'
    );

    let statusSum = 0;
    for (const statusName of expectedStatuses) {
      const item = analyticsData.statusBreakdown.find((s) => s.status === statusName);
      assert(item !== undefined, `Status "${statusName}" is present in statusBreakdown`);
      if (item) {
        statusSum += item.count;
        assert(typeof item.count === 'number' && item.count >= 0, `Status "${statusName}" count is non-negative`);
        assert(typeof item.percentage === 'number' && !isNaN(item.percentage), `Status "${statusName}" percentage is a valid number`);
      }
    }

    assert(
      statusSum === actualTotalEnquiries,
      `Sum of all status counts (${statusSum}) exactly equals total leads (${actualTotalEnquiries})`
    );

    // ---------------------------------------------------------
    // SECTION 5: MONTHLY VOLUME OVER TIME & ZERO FILLING
    // ---------------------------------------------------------
    console.log('\n[5. Chronological Monthly Volume & Zero-Count Handling]');
    assert(
      analyticsData.monthlyVolume.length === 6,
      'monthlyVolume contains exactly 6 rolling consecutive months'
    );

    for (let i = 0; i < analyticsData.monthlyVolume.length; i++) {
      const pt = analyticsData.monthlyVolume[i];
      assert(
        /^\d{4}-\d{2}$/.test(pt.period),
        `Period "${pt.period}" matches YYYY-MM format`
      );
      assert(
        typeof pt.label === 'string' && pt.label.length === 3,
        `Label "${pt.label}" is 3-letter month`
      );
      assert(
        typeof pt.count === 'number' && pt.count >= 0,
        `Count (${pt.count}) is a non-negative integer`
      );

      // Verify chronological ordering
      if (i > 0) {
        const prevPeriod = analyticsData.monthlyVolume[i - 1].period;
        assert(
          pt.period > prevPeriod,
          `Month ${pt.period} follows previous month ${prevPeriod} chronologically`
        );
      }
    }

    // ---------------------------------------------------------
    // SECTION 6: DATA REALITY AUDIT (NO FAKE DESTINATIONS)
    // ---------------------------------------------------------
    console.log('\n[6. Data Reality Check — No Fabricated Destination Stats]');
    assert(
      analyticsData.overview.topDestination === null,
      'overview.topDestination is null (no destination field on current enquiry form)'
    );
    assert(
      analyticsData.topDestinations.length === 0,
      'topDestinations array is empty (no fake data created)'
    );
    assert(
      analyticsData.destinationTrackingAvailable === false,
      'destinationTrackingAvailable flag is explicitly false'
    );

    // Check hotelCategoryBreakdown
    assert(
      Array.isArray(analyticsData.hotelCategoryBreakdown) && analyticsData.hotelCategoryBreakdown.length > 0,
      'hotelCategoryBreakdown is populated with real customer preferences'
    );

    await mongoose.disconnect();
  }

  // ---------------------------------------------------------
  // SECTION 7: SECURITY & SENSITIVE DATA AUDIT
  // ---------------------------------------------------------
  console.log('\n[7. Security Audit & Zero Secret Leaks]');
  {
    const jsonStr = JSON.stringify(analyticsData);
    assert(!jsonStr.includes('password'), 'Zero password mentions in response');
    assert(!jsonStr.includes('JWT_SECRET'), 'Zero JWT_SECRET mentions in response');
    assert(!jsonStr.includes('mongodb+srv'), 'Zero connection strings leaked in response');
    assert(!jsonStr.includes('stack'), 'Zero stack traces leaked in response');
  }

  console.log('\n======================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

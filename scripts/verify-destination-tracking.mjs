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

async function runVerification() {
  console.log('\n======================================================');
  console.log('PHASE 2 STEP 7A: DESTINATION TRACKING AUDIT SUITE');
  console.log('======================================================\n');

  // Track test created enquiry emails for cleanup
  const testEmailsToClean = [];
  let adminCookie = '';

  try {
    // ---------------------------------------------------------
    // STEP 0: ADMIN AUTHENTICATION
    // ---------------------------------------------------------
    console.log('[Step 0: Admin Authentication]');
    const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gmail.com',
        password: 'TravelAdmin@123',
      }),
    });

    assert(loginRes.status === 200, 'Admin login succeeds (200 OK)');
    const cookieHeader = loginRes.headers.get('set-cookie') || '';
    const match = cookieHeader.match(/admin_session=([^;]+)/);
    const token = match ? match[1] : '';
    assert(token.length > 20, 'Admin session cookie returned');
    adminCookie = `admin_session=${token}`;

    // ---------------------------------------------------------
    // STEP 1: FETCH REAL DESTINATIONS FOR VALID SLUGS
    // ---------------------------------------------------------
    console.log('\n[Step 1: Inspect Destination Catalog for Slugs]');
    const destRes = await fetch(`${BASE_URL}/api/destinations`);
    assert(destRes.status === 200, 'GET /api/destinations is publicly accessible (200)');
    const destJson = await destRes.json();
    assert(destJson.success && Array.isArray(destJson.data.destinations), 'Catalog returned destination array');
    
    const availableDestinations = destJson.data.destinations;
    assert(availableDestinations.length >= 2, `Found ${availableDestinations.length} active destinations in CMS catalog`);

    const targetDest1 = availableDestinations[0]; // e.g. Kenya or Bandhavgarh
    const targetDest2 = availableDestinations[1]; // e.g. another destination
    console.log(`  Using valid target destinations: "${targetDest1.name}" (${targetDest1.slug}) and "${targetDest2.name}" (${targetDest2.slug})`);

    // ---------------------------------------------------------
    // STEP 2: LEGACY BACKWARD COMPATIBILITY (NO DESTINATION)
    // ---------------------------------------------------------
    console.log('\n[Step 2: Phase 1 Enquiry Submission Backward Compatibility]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 45);
    const dateOfTravel = futureDate.toISOString().split('T')[0];

    const legacyEmail = `legacy_compat_${Date.now()}@example.com`;
    testEmailsToClean.push(legacyEmail);

    const legacyPayload = {
      fullName: 'Legacy Compatibility Traveler',
      countryCode: '+91',
      contactNumber: '9876543210',
      email: legacyEmail,
      dateOfTravel,
      numberOfPeople: 2,
      hotelCategory: 'Standard',
      numberOfChildren: 0,
    };

    const legacyRes = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legacyPayload),
    });

    assert(legacyRes.status === 201, 'Enquiry without destinationSlug succeeds (201 Created)');
    const legacyJson = await legacyRes.json();
    assert(legacyJson.success === true, 'Enquiry returns { success: true }');

    // ---------------------------------------------------------
    // STEP 3: INVALID DESTINATION REJECTION
    // ---------------------------------------------------------
    console.log('\n[Step 3: Server-side Rejection of Invalid Destination]');
    const invalidEmail = `invalid_dest_${Date.now()}@example.com`;
    const invalidPayload = {
      fullName: 'Attacker Fake Destination',
      countryCode: '+91',
      contactNumber: '9876543210',
      email: invalidEmail,
      dateOfTravel,
      numberOfPeople: 2,
      hotelCategory: 'Luxury',
      numberOfChildren: 0,
      destinationSlug: 'non-existent-destination-xyz-9999',
    };

    const invalidRes = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert(invalidRes.status === 400, 'Non-existent destinationSlug rejected with HTTP 400 Bad Request');
    const invalidJson = await invalidRes.json();
    assert(invalidJson.success === false, 'Invalid destination response has { success: false }');
    assert(
      invalidJson.error?.code === 'INVALID_REQUEST' || invalidJson.message?.includes('destination'),
      'Invalid destination response explains that the selected destination does not exist'
    );

    // Test malformed destination format
    const malformedPayload = {
      ...invalidPayload,
      destinationSlug: 'Invalid Slug With Spaces $$$',
    };
    const malformedRes = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(malformedPayload),
    });
    assert(malformedRes.status === 400, 'Malformed destination format rejected with 400 Bad Request');

    // ---------------------------------------------------------
    // STEP 4: SUBMIT NEW ENQUIRIES WITH REAL DESTINATIONS
    // ---------------------------------------------------------
    console.log('\n[Step 4: Submitting Valid Destination-Linked Enquiries]');
    // Submit 2 enquiries for targetDest1
    for (let i = 1; i <= 2; i++) {
      const email = `dest_track_${targetDest1.slug}_${i}_${Date.now()}@example.com`;
      testEmailsToClean.push(email);

      const res = await fetch(`${BASE_URL}/api/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: `Traveler For ${targetDest1.name} ${i}`,
          countryCode: '+91',
          contactNumber: '9876543210',
          email,
          dateOfTravel,
          numberOfPeople: 2,
          hotelCategory: 'Luxury',
          numberOfChildren: 0,
          destinationSlug: targetDest1.slug,
        }),
      });

      assert(res.status === 201, `Submitted valid enquiry for ${targetDest1.name} (201 Created)`);
    }

    // Submit 1 enquiry for targetDest2
    const dest2Email = `dest_track_${targetDest2.slug}_1_${Date.now()}@example.com`;
    testEmailsToClean.push(dest2Email);

    const res2 = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: `Traveler For ${targetDest2.name}`,
        countryCode: '+91',
        contactNumber: '9876543210',
        email: dest2Email,
        dateOfTravel,
        numberOfPeople: 4,
        hotelCategory: 'Deluxe',
        numberOfChildren: 1,
        destinationSlug: targetDest2.slug,
      }),
    });
    assert(res2.status === 201, `Submitted valid enquiry for ${targetDest2.name} (201 Created)`);

    // ---------------------------------------------------------
    // STEP 5: VERIFY ADMIN ENQUIRIES API RETURNS DESTINATION
    // ---------------------------------------------------------
    console.log('\n[Step 5: Admin Enquiries API Destination Fields Inspection]');
    const adminEnqRes = await fetch(`${BASE_URL}/api/enquiry?limit=10`, {
      headers: { Cookie: adminCookie },
    });
    assert(adminEnqRes.status === 200, 'GET /api/enquiry succeeds with admin cookie (200 OK)');
    const adminEnqJson = await adminEnqRes.json();
    assert(adminEnqJson.success, 'Admin enquiries returned success: true');

    const returnedEnquiries = adminEnqJson.data.enquiries;
    const trackedItem1 = returnedEnquiries.find((e) => e.destinationSlug === targetDest1.slug);
    assert(!!trackedItem1, `Admin enquiry list contains record with destinationSlug "${targetDest1.slug}"`);
    if (trackedItem1) {
      assert(
        trackedItem1.destinationName === targetDest1.name,
        `Admin enquiry record contains resolved destinationName "${trackedItem1.destinationName}"`
      );
      assert(
        trackedItem1.destination === targetDest1.name,
        `Admin enquiry record contains unified destination field "${trackedItem1.destination}"`
      );
    }

    const legacyInAdmin = returnedEnquiries.find((e) => e.email === legacyEmail);
    assert(!!legacyInAdmin, 'Legacy enquiry without destination is present in admin enquiries');
    if (legacyInAdmin) {
      assert(
        legacyInAdmin.destinationSlug === null && legacyInAdmin.destinationName === null,
        'Legacy enquiry has null destinationSlug and destinationName (not fabricated)'
      );
    }

    // ---------------------------------------------------------
    // STEP 6: PROTECTED ANALYTICS API WITH DESTINATION AGGREGATION
    // ---------------------------------------------------------
    console.log('\n[Step 6: Real Analytics Aggregation Audit]');
    // Check 401 without auth
    const unauthAnalytics = await fetch(`${BASE_URL}/api/analytics/summary`);
    assert(unauthAnalytics.status === 401, 'GET /api/analytics/summary is protected (401 Unauthorized)');

    // Fetch authenticated analytics
    const analyticsRes = await fetch(`${BASE_URL}/api/analytics/summary`, {
      headers: { Cookie: adminCookie },
    });
    assert(analyticsRes.status === 200, 'GET /api/analytics/summary succeeds with admin auth (200 OK)');
    const analyticsJson = await analyticsRes.json();
    assert(analyticsJson.success, 'Analytics returns success: true');

    const { overview, topDestinations, destinationTrackingAvailable, monthlyVolume, statusBreakdown } =
      analyticsJson.data;

    assert(
      destinationTrackingAvailable === true,
      'destinationTrackingAvailable is true when destination-linked enquiries exist'
    );
    assert(Array.isArray(topDestinations), 'topDestinations is an array');
    assert(topDestinations.length >= 2, `topDestinations contains ${topDestinations.length} ranked destinations`);

    console.log('  Aggregated Top Destinations:');
    topDestinations.forEach((td, idx) => {
      console.log(`    #${idx + 1}: ${td.destination} (${td.slug}) - ${td.count} enquiries`);
    });

    // Verify ordering: top destination should be targetDest1 because we submitted 2 enquiries for it
    assert(
      topDestinations[0].slug === targetDest1.slug,
      `Rank #1 destination is "${targetDest1.name}" with count ${topDestinations[0].count}`
    );
    assert(
      overview.topDestination === targetDest1.name,
      `Overview metric topDestination is populated with "${overview.topDestination}"`
    );
    assert(
      topDestinations[0].count >= (topDestinations[1]?.count || 0),
      'Destination rankings are sorted descending by enquiry count'
    );

    // Verify legacy records are still counted in total leads, monthly volume, and status breakdown
    assert(overview.totalLeads >= 3, `Total leads (${overview.totalLeads}) includes all enquiries`);
    const monthlySum = monthlyVolume.reduce((acc, m) => acc + m.count, 0);
    assert(monthlySum >= 3, `Monthly volume sum (${monthlySum}) includes all enquiries`);
    const statusSum = statusBreakdown.reduce((acc, s) => acc + s.count, 0);
    assert(statusSum >= 3, `Status breakdown sum (${statusSum}) matches total leads`);

    // ---------------------------------------------------------
    // STEP 7: REGRESSION - CHATBOT, CMS, AND SECRETS
    // ---------------------------------------------------------
    console.log('\n[Step 7: Regression Checks - Chatbot & Security]');
    // Chatbot test
    const chatRes = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'What wildlife destinations do you recommend?' }],
      }),
    });
    assert(chatRes.status === 200, 'POST /api/chat responds successfully (200 OK)');

    // Verify no secrets leaked in responses
    const rawJsonText = JSON.stringify(analyticsJson);
    assert(!rawJsonText.includes('JWT_SECRET'), 'No JWT_SECRET leaked in analytics response');
    assert(!rawJsonText.includes('passwordHash'), 'No passwordHash leaked in responses');
    assert(!rawJsonText.includes('mongodb+srv'), 'No MongoDB connection string leaked');

  } catch (err) {
    console.error('Test suite failed with unexpected error:', err);
    failed++;
  } finally {
    // ---------------------------------------------------------
    // CLEANUP: PURGE TEMPORARY TEST ENQUIRIES FROM MONGODB
    // ---------------------------------------------------------
    console.log('\n[Cleanup: Removing Temporary Test Records]');
    try {
      if (process.env.MONGODB_URI && testEmailsToClean.length > 0) {
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI);
        }
        const Enquiry =
          mongoose.models.Enquiry ||
          mongoose.model('Enquiry', new mongoose.Schema({}, { strict: false }));
        const deleteRes = await Enquiry.deleteMany({ email: { $in: testEmailsToClean } });
        console.log(`  Cleaned up ${deleteRes.deletedCount} temporary test enquiries.`);
      }
    } catch (cleanErr) {
      console.error('Cleanup warning:', cleanErr);
    } finally {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
    }
  }

  console.log('\n======================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();

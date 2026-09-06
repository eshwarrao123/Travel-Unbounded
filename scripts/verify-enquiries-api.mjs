import fs from 'fs';
import path from 'path';

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
  console.log('STARTING PHASE 2 STEP 4: ADMIN ENQUIRIES API AUDIT');
  console.log('======================================================\n');

  let adminCookie = '';
  let testEnquiryId = '';
  const testEmail = `audit_tester_${Date.now()}@example.com`;
  const testName = 'Devendra TestUser';

  // ---------------------------------------------------------
  // SECTION 1: PUBLIC POST /api/enquiry REGRESSION & COMPATIBILITY
  // ---------------------------------------------------------
  console.log('[1. Public POST /api/enquiry Regression & Compatibility]');
  {
    // Test 1.1: Submit valid enquiry without auth
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateOfTravel = futureDate.toISOString().split('T')[0];

    const validPayload = {
      fullName: testName,
      countryCode: '+91',
      contactNumber: '9876543210',
      email: testEmail,
      dateOfTravel,
      numberOfPeople: 3,
      hotelCategory: 'Luxury',
      numberOfChildren: 1,
    };

    const resValid = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload),
    });

    assert(resValid.status === 201, 'Public POST /api/enquiry accepts valid enquiry (201 Created)');
    const resValidJson = await resValid.json();
    assert(resValidJson.success === true, 'Public POST returns { success: true }');
    assert(
      resValidJson.message === 'Enquiry submitted successfully.',
      'Public POST returns friendly confirmation message'
    );

    // Test 1.2: Invalid enquiry submission (empty body)
    const resEmpty = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(resEmpty.status === 400, 'Public POST rejects empty body with 400 Bad Request');
    const resEmptyJson = await resEmpty.json();
    assert(resEmptyJson.success === false, 'Public POST rejection has { success: false }');
    assert(resEmptyJson.errors !== undefined, 'Public POST rejection contains validation errors object');

    // Test 1.3: Malformed JSON payload
    const resBadJson = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{ not valid json',
    });
    assert(resBadJson.status === 400, 'Public POST rejects malformed JSON with 400 Bad Request');
  }

  // ---------------------------------------------------------
  // SECTION 2: AUTHENTICATION ENFORCEMENT ON ADMIN ENQUIRY APIS
  // ---------------------------------------------------------
  console.log('\n[2. Authentication Enforcement on Admin Enquiry Endpoints]');
  {
    // Test 2.1: GET /api/enquiry unauthenticated
    const resGetUnauth = await fetch(`${BASE_URL}/api/enquiry`);
    assert(resGetUnauth.status === 401, 'GET /api/enquiry without session returns 401 Unauthorized');
    const getUnauthJson = await resGetUnauth.json();
    assert(getUnauthJson.success === false, 'Unauthenticated response has success: false');
    assert(getUnauthJson.error?.code === 'UNAUTHORIZED', 'Error code is "UNAUTHORIZED"');

    // Test 2.2: GET /api/enquiry with invalid session token
    const resGetBadToken = await fetch(`${BASE_URL}/api/enquiry`, {
      headers: { Cookie: 'admin_session=invalid.bogus.token' },
    });
    assert(resGetBadToken.status === 401, 'GET /api/enquiry with invalid token returns 401 Unauthorized');

    // Test 2.3: PATCH /api/enquiry/507f1f77bcf86cd799439011 unauthenticated
    const resPatchUnauth = await fetch(`${BASE_URL}/api/enquiry/507f1f77bcf86cd799439011`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    assert(resPatchUnauth.status === 401, 'PATCH /api/enquiry/[id] without session returns 401 Unauthorized');
    const patchUnauthJson = await resPatchUnauth.json();
    assert(patchUnauthJson.error?.code === 'UNAUTHORIZED', 'PATCH unauthorized code is "UNAUTHORIZED"');

    // Test 2.4: Log in as admin to obtain valid session cookie
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
  // SECTION 3: CANONICAL GET /api/enquiry SPECIFICATION AUDIT
  // ---------------------------------------------------------
  console.log('\n[3. Canonical GET /api/enquiry Contract & Response Envelope]');
  {
    const res = await fetch(`${BASE_URL}/api/enquiry`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });

    assert(res.status === 200, 'GET /api/enquiry returns 200 OK with valid admin session');
    const json = await res.json();

    assert(json.success === true, 'Response envelope has success: true');
    assert(typeof json.data === 'object' && json.data !== null, 'Response has data object');
    assert(Array.isArray(json.data.enquiries), 'data.enquiries is an Array');
    assert(typeof json.data.pagination === 'object', 'data.pagination is an Object');
    assert(typeof json.data.pagination.page === 'number', 'pagination.page is a number');
    assert(typeof json.data.pagination.limit === 'number', 'pagination.limit is a number');
    assert(typeof json.data.pagination.total === 'number', 'pagination.total is a number');
    assert(typeof json.data.pagination.totalPages === 'number', 'pagination.totalPages is a number');
    assert(json.data.pagination.total >= 1, 'Found at least 1 enquiry (our submitted test enquiry)');

    // Verify enquiry object structure
    const sample = json.data.enquiries[0];
    assert(typeof sample.id === 'string' && sample.id.length === 24, 'Enquiry has valid string id');
    assert(typeof sample.name === 'string', 'Enquiry has string name');
    assert(typeof sample.fullName === 'string', 'Enquiry has string fullName');
    assert(typeof sample.email === 'string', 'Enquiry has string email');
    assert(typeof sample.phone === 'string', 'Enquiry has formatted phone string');
    assert(typeof sample.travelDate === 'string', 'Enquiry has string travelDate');
    assert(typeof sample.people === 'number', 'Enquiry has numeric people count');
    assert(typeof sample.hotelCategory === 'string', 'Enquiry has string hotelCategory');
    assert(typeof sample.status === 'string', 'Enquiry has string status');
    assert(typeof sample.createdAt === 'string', 'Enquiry has ISO string createdAt');

    // Security check: no private internals leaked
    const sampleStr = JSON.stringify(sample);
    assert(!sampleStr.includes('__v'), 'Mongoose __v is stripped from enquiry representation');
    assert(!sampleStr.includes('password'), 'Zero password references present');
  }

  // ---------------------------------------------------------
  // SECTION 4: SERVER-SIDE PAGINATION AUDIT
  // ---------------------------------------------------------
  console.log('\n[4. Server-Side Pagination & Validation]');
  {
    // Test 4.1: Custom page & limit
    const resCustom = await fetch(`${BASE_URL}/api/enquiry?page=1&limit=2`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resCustom.status === 200, 'GET /api/enquiry?page=1&limit=2 returns 200 OK');
    const customJson = await resCustom.json();
    assert(customJson.data.pagination.page === 1, 'pagination.page reflects requested page 1');
    assert(customJson.data.pagination.limit === 2, 'pagination.limit reflects requested limit 2');
    assert(customJson.data.enquiries.length <= 2, 'data.enquiries length is <= limit 2');

    // Test 4.2: Invalid page <= 0
    const resBadPage = await fetch(`${BASE_URL}/api/enquiry?page=0`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resBadPage.status === 400, 'GET /api/enquiry?page=0 returns 400 Bad Request');
    const badPageJson = await resBadPage.json();
    assert(badPageJson.error?.code === 'INVALID_REQUEST', 'Error code is "INVALID_REQUEST"');

    // Test 4.3: Negative page
    const resNegPage = await fetch(`${BASE_URL}/api/enquiry?page=-5`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resNegPage.status === 400, 'GET /api/enquiry?page=-5 returns 400 Bad Request');

    // Test 4.4: Limit > 50 (disallowed)
    const resOverLimit = await fetch(`${BASE_URL}/api/enquiry?limit=55`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resOverLimit.status === 400, 'GET /api/enquiry?limit=55 returns 400 Bad Request (exceeds max 50)');

    // Test 4.5: Non-numeric page
    const resNaNPage = await fetch(`${BASE_URL}/api/enquiry?page=first`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resNaNPage.status === 400, 'GET /api/enquiry?page=first returns 400 Bad Request');
  }

  // ---------------------------------------------------------
  // SECTION 5: SEARCH FILTERING AUDIT (NAME & EMAIL)
  // ---------------------------------------------------------
  console.log('\n[5. Case-Insensitive Search by Customer Name & Email]');
  {
    // Test 5.1: Search by name (lowercase substring)
    const resSearchName = await fetch(`${BASE_URL}/api/enquiry?search=devendra`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resSearchName.status === 200, 'GET /api/enquiry?search=devendra returns 200 OK');
    const searchNameJson = await resSearchName.json();
    assert(searchNameJson.data.enquiries.length >= 1, 'Search matches created record "Devendra TestUser"');
    const matched = searchNameJson.data.enquiries.find((e) => e.email === testEmail);
    assert(matched !== undefined, 'Found exact test enquiry by customer name search');
    if (matched) testEnquiryId = matched.id;

    // Test 5.2: Search by email
    const emailPrefix = testEmail.split('@')[0];
    const resSearchEmail = await fetch(`${BASE_URL}/api/enquiry?search=${emailPrefix}`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resSearchEmail.status === 200, `GET /api/enquiry?search=${emailPrefix} returns 200 OK`);
    const searchEmailJson = await resSearchEmail.json();
    assert(
      searchEmailJson.data.enquiries.some((e) => e.email === testEmail),
      'Search matches record by email address'
    );

    // Test 5.3: Search with regex special characters (safe handling, no ReDoS/crash)
    const resSearchRegex = await fetch(
      `${BASE_URL}/api/enquiry?search=${encodeURIComponent('test+user*(hello)')}`,
      {
        headers: { Cookie: `admin_session=${adminCookie}` },
      }
    );
    assert(resSearchRegex.status === 200, 'Search with regex characters does not crash (200 OK)');

    // Test 5.4: Search with non-matching query
    const resSearchNone = await fetch(
      `${BASE_URL}/api/enquiry?search=completely_nonexistent_xyz_123456`,
      {
        headers: { Cookie: `admin_session=${adminCookie}` },
      }
    );
    assert(resSearchNone.status === 200, 'Search with no matches returns 200 OK');
    const searchNoneJson = await resSearchNone.json();
    assert(searchNoneJson.data.enquiries.length === 0, 'No records returned for non-matching search');
    assert(searchNoneJson.data.pagination.total === 0, 'pagination.total is 0');
  }

  // ---------------------------------------------------------
  // SECTION 6: STATUS FILTERING AUDIT
  // ---------------------------------------------------------
  console.log('\n[6. Status Filtering & Validation]');
  {
    // Test 6.1: Valid status filter "New"
    const resStatusNew = await fetch(`${BASE_URL}/api/enquiry?status=New`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resStatusNew.status === 200, 'GET /api/enquiry?status=New returns 200 OK');
    const statusNewJson = await resStatusNew.json();
    const allAreNew = statusNewJson.data.enquiries.every((e) => e.status === 'New');
    assert(allAreNew, 'All returned enquiries have status === "New"');

    // Test 6.2: Invalid status filter "Pending"
    const resBadStatus = await fetch(`${BASE_URL}/api/enquiry?status=Pending`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resBadStatus.status === 400, 'GET /api/enquiry?status=Pending returns 400 Bad Request');
    const badStatusJson = await resBadStatus.json();
    assert(badStatusJson.error?.code === 'INVALID_REQUEST', 'Rejects with code "INVALID_REQUEST"');
    assert(
      badStatusJson.error?.message?.includes('Allowed values'),
      'Provides list of allowed status enum values'
    );
  }

  // ---------------------------------------------------------
  // SECTION 7: PROTECTED STATUS UPDATE API (PATCH /api/enquiry/[id])
  // ---------------------------------------------------------
  console.log('\n[7. Protected Enquiry Status Update API (PATCH /api/enquiry/[id])]');
  {
    assert(testEnquiryId.length === 24, `Using test enquiry id: ${testEnquiryId}`);

    // Test 7.1: Invalid ObjectId format
    const resBadId = await fetch(`${BASE_URL}/api/enquiry/12345notvalid`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin_session=${adminCookie}`,
      },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    assert(resBadId.status === 400, 'PATCH with malformed ObjectId returns 400 Bad Request');
    const badIdJson = await resBadId.json();
    assert(badIdJson.error?.code === 'INVALID_REQUEST', 'Error code is "INVALID_REQUEST"');

    // Test 7.2: Non-existent ObjectId
    const nonExistentId = '507f1f77bcf86cd799439011';
    const resNotFound = await fetch(`${BASE_URL}/api/enquiry/${nonExistentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin_session=${adminCookie}`,
      },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    assert(resNotFound.status === 404, 'PATCH on non-existent enquiry returns 404 Not Found');
    const notFoundJson = await resNotFound.json();
    assert(notFoundJson.error?.code === 'NOT_FOUND', 'Error code is "NOT_FOUND"');

    // Test 7.3: Invalid status value
    const resInvalidStatus = await fetch(`${BASE_URL}/api/enquiry/${testEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin_session=${adminCookie}`,
      },
      body: JSON.stringify({ status: 'Completed' }),
    });
    assert(resInvalidStatus.status === 400, 'PATCH with invalid status "Completed" returns 400 Bad Request');

    // Test 7.4: Empty payload
    const resEmptyPatch = await fetch(`${BASE_URL}/api/enquiry/${testEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin_session=${adminCookie}`,
      },
      body: JSON.stringify({}),
    });
    assert(resEmptyPatch.status === 400, 'PATCH with empty payload returns 400 Bad Request');

    // Test 7.5: Valid status update to "Contacted"
    const resUpdateContacted = await fetch(`${BASE_URL}/api/enquiry/${testEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin_session=${adminCookie}`,
      },
      body: JSON.stringify({ status: 'Contacted' }),
    });
    assert(resUpdateContacted.status === 200, 'PATCH status to "Contacted" returns 200 OK');
    const contactedJson = await resUpdateContacted.json();
    assert(contactedJson.success === true, 'Response has success: true');
    assert(contactedJson.data?.status === 'Contacted', 'Updated status is "Contacted"');
    assert(contactedJson.data?.id === testEnquiryId, 'Returned ID matches test enquiry ID');
    assert(contactedJson.data?.email === testEmail, 'Customer email remained intact');
    assert(contactedJson.data?.fullName === testName, 'Customer name remained intact');
    assert(typeof contactedJson.data?.updatedAt === 'string', 'updatedAt timestamp was updated');

    // Test 7.6: Valid status update to "Converted"
    const resUpdateConverted = await fetch(`${BASE_URL}/api/enquiry/${testEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin_session=${adminCookie}`,
      },
      body: JSON.stringify({ status: 'Converted' }),
    });
    assert(resUpdateConverted.status === 200, 'PATCH status to "Converted" returns 200 OK');
    const convertedJson = await resUpdateConverted.json();
    assert(convertedJson.data?.status === 'Converted', 'Updated status is now "Converted"');

    // Test 7.7: Attempt to modify arbitrary fields via PATCH (field isolation guard)
    const resTamperAttempt = await fetch(`${BASE_URL}/api/enquiry/${testEnquiryId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `admin_session=${adminCookie}`,
      },
      body: JSON.stringify({
        status: 'Closed',
        fullName: 'Hacked Name',
        email: 'hacker@example.com',
        numberOfPeople: 999,
      }),
    });
    assert(resTamperAttempt.status === 200, 'PATCH with extra fields updates status successfully');
    const tamperJson = await resTamperAttempt.json();
    assert(tamperJson.data?.status === 'Closed', 'Status updated to "Closed"');
    assert(tamperJson.data?.fullName === testName, 'Customer name was NOT modified by PATCH');
    assert(tamperJson.data?.email === testEmail, 'Customer email was NOT modified by PATCH');
    assert(tamperJson.data?.numberOfPeople === 3, 'People count was NOT modified by PATCH');
  }

  // ---------------------------------------------------------
  // SECTION 8: STATUS FILTER VERIFICATION FOR UPDATED STATUS
  // ---------------------------------------------------------
  console.log('\n[8. Status Filter Verification on Updated Records]');
  {
    const resFilterClosed = await fetch(`${BASE_URL}/api/enquiry?status=Closed`, {
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resFilterClosed.status === 200, 'GET /api/enquiry?status=Closed returns 200 OK');
    const closedJson = await resFilterClosed.json();
    const foundUpdated = closedJson.data.enquiries.find((e) => e.id === testEnquiryId);
    assert(foundUpdated !== undefined, 'The updated enquiry appears in status=Closed filter results');
    assert(foundUpdated?.status === 'Closed', 'Found enquiry has status "Closed"');
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

/**
 * Phase 2 Step 6 — Destination CMS & database-backed public destinations audit.
 * Requires the dev server running on port 3005:  npx next dev -p 3005
 * Usage: node scripts/verify-destinations-api.mjs
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local (only for ADMIN_SEED_* overrides; no secrets are printed)
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

const BASE_URL = process.env.VERIFY_BASE_URL || 'http://localhost:3005';
const ADMIN_EMAIL = (process.env.ADMIN_SEED_EMAIL || 'admin@gmail.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'TravelAdmin@123';

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

// Load the static source data for the static-vs-database comparison
async function loadStaticDestinations() {
  const dataPath = path.resolve(__dirname, '..', 'data', 'destinations.ts');
  let source = fs.readFileSync(dataPath, 'utf8');
  source = source.replace(/^import[^\n]*\n/m, '');
  source = source.replace(/export const destinations\s*:\s*Destination\[\]\s*=/, 'const destinations =');
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tub-verify-'));
  const tempFile = path.join(tempDir, 'destinations.mjs');
  fs.writeFileSync(tempFile, source + '\nexport default destinations;\n');
  try {
    const mod = await require0(tempFile);
    return mod.default;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

function require0(file) {
  // Synchronous dynamic import wrapper via child-less approach:
  // use createRequire-less ESM strategy with fs + eval is fragile, so use
  // a blocking subprocess-free approach: import() is async, handled by caller.
  return import(`file://${file.replace(/\\/g, '/')}?t=${Date.now()}`);
}

async function runTests() {
  console.log('\n===================================================');
  console.log('STARTING PHASE 2 STEP 6 DESTINATION CMS AUDIT');
  console.log('===================================================\n');

  const staticDestinations = await loadStaticDestinations();

  // ---------------------------------------------------------- Phase 1 regression
  console.log('[Phase 1 & Phase 2 Regression Checks]');
  {
    const resHome = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
    assert(resHome.status === 200, 'Public homepage (/) renders (200 OK)');

    const resDest = await fetch(`${BASE_URL}/destinations`, { redirect: 'manual' });
    const destHtml = await resDest.text();
    assert(resDest.status === 200, 'Public destinations page (/destinations) renders (200 OK)');
    assert(destHtml.includes('Kerala') && destHtml.includes('Kenya'), 'Destinations page lists migrated India + International destinations');

    const resDetail = await fetch(`${BASE_URL}/destinations/kerala`, { redirect: 'manual' });
    const detailHtml = await resDetail.text();
    assert(resDetail.status === 200, 'Destination detail page (/destinations/kerala) renders (200 OK)');
    assert(detailHtml.includes('35,000'), 'Detail page shows database-backed price (INR 35,000)');

    const resContact = await fetch(`${BASE_URL}/contact`, { redirect: 'manual' });
    assert(resContact.status === 200, 'Public contact page (/contact) still renders (200 OK)');

    const resEnquiryPost = await fetch(`${BASE_URL}/api/enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(resEnquiryPost.status === 400, 'POST /api/enquiry with empty body returns 400 (enquiry API intact)');

    const resEnquiryGet = await fetch(`${BASE_URL}/api/enquiry`, { redirect: 'manual' });
    assert(resEnquiryGet.status === 401, 'GET /api/enquiry without admin session returns 401');

    const resChat = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(resChat.status === 400 || resChat.status === 500, 'POST /api/chat with invalid body is rejected (chat API intact)');

    const resAdmin = await fetch(`${BASE_URL}/admin/dashboard`, { redirect: 'manual' });
    assert(
      resAdmin.status === 307 || resAdmin.status === 308,
      'Unauthenticated /admin/dashboard redirects to login (admin auth intact)'
    );
  }

  // -------------------------------------------------- Public GET + data comparison
  console.log('\n[GET /api/destinations (Public) + Migration Verification]');
  let initialCount = 0;
  {
    const res = await fetch(`${BASE_URL}/api/destinations`);
    assert(res.status === 200, 'GET /api/destinations is publicly accessible (200 OK)');
    const data = await res.json();
    assert(data.success === true, 'GET response has success: true');
    assert(Array.isArray(data.data?.destinations), 'GET response contains data.destinations array');
    initialCount = data.data.destinations.length;
    assert(initialCount >= staticDestinations.length, `GET returns ${initialCount} destinations (>= ${staticDestinations.length} source records)`);

    const raw = JSON.stringify(data);
    assert(!raw.includes('__v') && !raw.includes('"_id"'), 'Response exposes no MongoDB internals (__v / _id)');
    assert(!raw.toLowerCase().includes('mongodb+srv'), 'Response leaks no MongoDB credentials');

    // Static vs database field-by-field comparison
    let mismatches = 0;
    for (const src of staticDestinations) {
      const db = data.data.destinations.find((d) => d.slug === src.slug);
      if (!db) { console.error(`    missing slug: ${src.slug}`); mismatches++; continue; }
      const fields = ['name', 'country', 'category', 'region', 'shortDescription', 'description', 'heroImage', 'duration', 'startingPrice', 'featured'];
      for (const f of fields) {
        if ((db[f] ?? null) !== (src[f] ?? null)) {
          console.error(`    mismatch ${src.slug}.${f}: db=${JSON.stringify(db[f])} static=${JSON.stringify(src[f])}`);
          mismatches++;
        }
      }
      if (!Array.isArray(db.tags) || db.tags.length === 0) {
        console.error(`    mismatch ${src.slug}.tags: expected seeded tags`);
        mismatches++;
      }
      if (JSON.stringify(db.galleryImages) !== JSON.stringify(src.galleryImages || [])) mismatches++;
      if (JSON.stringify(db.highlights) !== JSON.stringify(src.highlights || [])) mismatches++;
      if (JSON.stringify(db.experiences) !== JSON.stringify(src.experiences || [])) mismatches++;
      if (JSON.stringify(db.bestTimeToVisit) !== JSON.stringify(src.bestTimeToVisit || [])) mismatches++;
    }
    assert(mismatches === 0, 'All migrated destinations match the static source data (no data loss)');

    // Category filter
    const resIndia = await fetch(`${BASE_URL}/api/destinations?category=india`);
    const indiaData = await resIndia.json();
    assert(
      resIndia.status === 200 && indiaData.data.destinations.every((d) => d.category === 'india'),
      'GET /api/destinations?category=india returns only India destinations'
    );
  }

  // ------------------------------------------------------------ Admin login
  console.log('\n[Admin Session]');
  let adminCookie = '';
  {
    const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    assert(res.status === 200, `Admin login succeeds (${ADMIN_EMAIL})`);
    const setCookie = res.headers.get('set-cookie') || '';
    const match = setCookie.match(/admin_session=([^;]+)/);
    adminCookie = match ? match[1] : '';
    assert(Boolean(adminCookie), 'Login issues admin_session cookie');
  }

  // ------------------------------------------------------------ POST /api/destinations
  console.log('\n[POST /api/destinations]');
  let createdId = '';
  const testSlug = 'verify-test-destination';
  {
    const resNoAuth = await fetch(`${BASE_URL}/api/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'X', category: 'india', description: 'x', imageUrl: 'https://example.com/x.jpg' }),
    });
    assert(resNoAuth.status === 401, 'POST without admin session is rejected (401)');

    const invalidPayloads = [
      { body: {}, label: 'empty payload' },
      { body: { name: '', category: 'india', description: 'x', imageUrl: 'https://example.com/x.jpg' }, label: 'empty name' },
      { body: { name: 'Y', category: 'mars', description: 'x', imageUrl: 'https://example.com/x.jpg' }, label: 'invalid category' },
      { body: { name: 'Y', category: 'india', description: 'x', imageUrl: 'notaurl' }, label: 'invalid image URL' },
      { body: { name: 'Y', category: 'india', description: 'x', imageUrl: 'https://example.com/x.jpg', price: -5 }, label: 'negative price' },
      { body: { name: 'Y', category: 'india', description: 'x', imageUrl: 'https://example.com/x.jpg', tags: [1, 2] }, label: 'non-string tags' },
    ];
    let invalidRejected = true;
    for (const t of invalidPayloads) {
      const r = await fetch(`${BASE_URL}/api/destinations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: `admin_session=${adminCookie}` },
        body: JSON.stringify(t.body),
      });
      if (r.status !== 400) {
        console.error(`    invalid payload (${t.label}) returned ${r.status}, expected 400`);
        invalidRejected = false;
      }
    }
    assert(invalidRejected, 'All invalid create payloads rejected with 400 (name/category/URL/price/tags validation)');

    const resCreate = await fetch(`${BASE_URL}/api/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_session=${adminCookie}` },
      body: JSON.stringify({
        name: 'Verify Test Destination',
        price: 12345,
        category: 'india',
        imageUrl: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=400&auto=format&fit=crop',
        description: 'A temporary destination created by the Step 6 verification script.',
        tags: ['Nature', 'Test'],
      }),
    });
    assert(resCreate.status === 201, 'POST with admin session creates destination (201)');
    const createData = await resCreate.json();
    createdId = createData.data?.id || '';
    assert(Boolean(createdId), 'Created destination returns a sanitized id');
    assert(createData.data?.slug === 'verify-test-destination', 'Slug auto-generated from name');
    assert(Array.isArray(createData.data?.tags) && createData.data.tags.length === 2, 'Tags persisted');

    const resDup = await fetch(`${BASE_URL}/api/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_session=${adminCookie}` },
      body: JSON.stringify({
        name: 'Verify Test Destination',
        category: 'india',
        description: 'duplicate',
        imageUrl: 'https://example.com/dup.jpg',
      }),
    });
    assert(resDup.status === 409, 'Duplicate slug returns 409 Conflict');
  }

  // ------------------------------------------------------------ PATCH /api/destinations/[id]
  console.log('\n[PATCH /api/destinations/[id]]');
  {
    const resNoAuth = await fetch(`${BASE_URL}/api/destinations/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 999 }),
    });
    assert(resNoAuth.status === 401, 'PATCH without admin session is rejected (401)');

    const resBadId = await fetch(`${BASE_URL}/api/destinations/not-an-objectid`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_session=${adminCookie}` },
      body: JSON.stringify({ price: 999 }),
    });
    assert(resBadId.status === 400, 'PATCH with invalid ObjectId returns 400');

    const resMissing = await fetch(`${BASE_URL}/api/destinations/aaaaaaaaaaaaaaaaaaaaaaaa`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_session=${adminCookie}` },
      body: JSON.stringify({ price: 999 }),
    });
    assert(resMissing.status === 404, 'PATCH with nonexistent ObjectId returns 404');

    const resForbidden = await fetch(`${BASE_URL}/api/destinations/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_session=${adminCookie}` },
      body: JSON.stringify({ _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', createdAt: '2000-01-01T00:00:00.000Z', price: 999 }),
    });
    assert(resForbidden.status === 400, 'PATCH rejecting protected fields (_id / createdAt) returns 400');

    const resPatch = await fetch(`${BASE_URL}/api/destinations/${createdId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: `admin_session=${adminCookie}` },
      body: JSON.stringify({ price: 54321, tags: ['Updated'], featured: true }),
    });
    assert(resPatch.status === 200, 'PATCH with admin session updates destination (200)');
    const patchData = await resPatch.json();
    assert(patchData.data?.startingPrice === 54321, 'PATCH result reflects new price');
    assert(JSON.stringify(patchData.data?.tags) === JSON.stringify(['Updated']), 'PATCH result reflects new tags');
  }

  // ------------------------------------------------------------ DELETE /api/destinations/[id]
  console.log('\n[DELETE /api/destinations/[id]]');
  {
    const resNoAuth = await fetch(`${BASE_URL}/api/destinations/${createdId}`, { method: 'DELETE' });
    assert(resNoAuth.status === 401, 'DELETE without admin session is rejected (401)');

    const resBadId = await fetch(`${BASE_URL}/api/destinations/zzzz`, {
      method: 'DELETE',
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resBadId.status === 400, 'DELETE with invalid ObjectId returns 400');

    const resDelete = await fetch(`${BASE_URL}/api/destinations/${createdId}`, {
      method: 'DELETE',
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resDelete.status === 200, 'DELETE with admin session removes the destination (200)');

    const resGone = await fetch(`${BASE_URL}/api/destinations/${createdId}`, {
      method: 'DELETE',
      headers: { Cookie: `admin_session=${adminCookie}` },
    });
    assert(resGone.status === 404, 'Deleting the same destination again returns 404');

    const resList = await fetch(`${BASE_URL}/api/destinations`);
    const listData = await resList.json();
    assert(
      listData.data.destinations.length === initialCount && !listData.data.destinations.some((d) => d.slug === testSlug),
      'Catalog restored to original migrated set after cleanup'
    );
  }

  console.log('\n===================================================');
  console.log(`AUDIT RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('===================================================\n');

  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error('Fatal error during verification run:', err);
  process.exit(1);
});

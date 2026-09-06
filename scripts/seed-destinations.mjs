/**
 * Safe, idempotent migration/seed of the Phase 1 static destination data into MongoDB.
 *
 * - Reads the existing source data from data/destinations.ts (source of truth)
 * - Upserts destinations by their stable `slug` identifier
 * - Running repeatedly NEVER creates duplicates
 * - Never deletes existing destinations, never touches enquiries or users
 * - Never logs secrets or MongoDB credentials
 *
 * Usage: npm run seed:destinations
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

// ---------------------------------------------------------------- env loading
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment or .env.local');
  process.exit(1);
}

// ---------------------------------------------- load static source data (TS)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, '..', 'data', 'destinations.ts');

async function loadStaticDestinations() {
  let source = fs.readFileSync(dataPath, 'utf8');
  // Strip the single TypeScript-specific line and the type annotation so the
  // remaining pure object-literal array can be imported as a plain ES module.
  source = source.replace(/^import[^\n]*\n/m, '');
  source = source.replace(/export const destinations\s*:\s*Destination\[\]\s*=/, 'const destinations =');
  if (!/const destinations\s*=/.test(source)) {
    console.error('Error: could not parse data/destinations.ts — unexpected file format.');
    process.exit(1);
  }
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tub-seed-'));
  const tempFile = path.join(tempDir, 'destinations.mjs');
  fs.writeFileSync(tempFile, source + '\nexport default destinations;\n');
  try {
    // File URL + cache-busting query so repeated runs never read a stale module
    const mod = await import(`file://${tempFile.replace(/\\/g, '/')}?t=${Date.now()}`);
    return mod.default;
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

const staticDestinations = await loadStaticDestinations();

if (!Array.isArray(staticDestinations) || staticDestinations.length === 0) {
  console.error('Error: no destinations found in data/destinations.ts');
  process.exit(1);
}

// ------------------------------------------------------- schema (mirrors app)
const DestinationSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    category: { type: String, required: true, enum: ['india', 'international'], index: true },
    region: { type: String, required: true, enum: ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania', 'Middle East'], default: 'Asia' },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    heroImage: { type: String, required: true, trim: true },
    galleryImages: { type: [String], default: [] },
    bestTimeToVisit: { type: [String], default: [] },
    duration: { type: String, default: '', trim: true },
    startingPrice: { type: Number, default: 0, min: 0 },
    highlights: { type: [String], default: [] },
    experiences: {
      type: [
        {
          title: { type: String, required: true, trim: true },
          description: { type: String, required: true, trim: true },
          icon: { type: String, trim: true },
        },
      ],
      default: [],
    },
    travelStyle: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    metadata: {
      type: {
        climate: { type: String, trim: true },
        language: { type: String, trim: true },
        currency: { type: String, trim: true },
        timezone: { type: String, trim: true },
      },
      default: undefined,
    },
  },
  { timestamps: true }
);

const Destination = mongoose.models.Destination || mongoose.model('Destination', DestinationSchema);

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

/** Maps a static destination record onto the Destination document shape. */
function buildDoc(d) {
  const tags =
    Array.isArray(d.tags) && d.tags.length > 0
      ? d.tags.map((t) => String(t).trim()).filter(Boolean)
      : (Array.isArray(d.travelStyle) ? d.travelStyle.map(capitalize) : []);
  return {
    slug: d.slug,
    name: d.name,
    country: d.country,
    category: d.category,
    region: d.region || 'Asia',
    shortDescription: d.shortDescription,
    description: d.description,
    heroImage: d.heroImage,
    galleryImages: Array.isArray(d.galleryImages) ? d.galleryImages : [],
    bestTimeToVisit: Array.isArray(d.bestTimeToVisit) ? d.bestTimeToVisit : [],
    duration: d.duration || '',
    startingPrice: typeof d.startingPrice === 'number' ? d.startingPrice : 0,
    highlights: Array.isArray(d.highlights) ? d.highlights : [],
    experiences: Array.isArray(d.experiences)
      ? d.experiences.map((e) => ({
          title: e.title,
          description: e.description,
          ...(e.icon ? { icon: e.icon } : {}),
        }))
      : [],
    travelStyle: Array.isArray(d.travelStyle) ? d.travelStyle : [],
    tags,
    featured: Boolean(d.featured),
    ...(d.metadata && Object.keys(d.metadata).length > 0 ? { metadata: d.metadata } : {}),
  };
}

// ------------------------------------------------------------- safe upsert
async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('Connected.\n');

    console.log(`Migrating ${staticDestinations.length} destinations from data/destinations.ts ...\n`);

    let upserted = 0;
    let modified = 0;

    for (const source of staticDestinations) {
      const doc = buildDoc(source);

      if (!doc.slug || !doc.name || !doc.category || !doc.heroImage || !doc.description) {
        console.error(`Skipping malformed source record: ${JSON.stringify({ slug: doc.slug, name: doc.name })}`);
        continue;
      }

      // Upsert by stable slug: update content fields when present,
      // insert as new document when missing. createdAt is set by the
      // schema timestamps only on first insert — never overwritten.
      const result = await Destination.updateOne(
        { slug: doc.slug },
        { $set: doc },
        { upsert: true, setDefaultsOnInsert: true }
      );

      upserted += result.upsertedCount || 0;
      modified += result.modifiedCount || 0;

      const action = (result.upsertedCount || 0) > 0 ? 'created' : (result.modifiedCount || 0) > 0 ? 'updated' : 'unchanged';
      console.log(`  - ${doc.slug.padEnd(20)} [${doc.category}] ${action}`);
    }

    console.log('\nMigration summary:');
    console.log(`  source records : ${staticDestinations.length}`);
    console.log(`  created        : ${upserted}`);
    console.log(`  updated        : ${modified}`);
    console.log(`  unchanged      : ${staticDestinations.length - upserted - modified}`);

    // ------------------------------------------ migration verification gate
    const slugs = staticDestinations.map((d) => d.slug).filter(Boolean);
    const dbDocs = await Destination.find({ slug: { $in: slugs } })
      .select('slug name category region startingPrice heroImage tags')
      .lean();

    const missing = slugs.filter((slug) => !dbDocs.some((d) => d.slug === slug));
    if (missing.length > 0) {
      console.error(`\nVERIFICATION FAILED — missing destinations in database: ${missing.join(', ')}`);
      await mongoose.disconnect();
      process.exit(1);
    }

    const totalInDb = await Destination.countDocuments({});
    console.log(`\nVERIFICATION PASSED — all ${slugs.length} source destinations present in MongoDB (collection total: ${totalInDb}).`);
    console.log('\nMigrated destination catalog:');
    for (const d of dbDocs) {
      console.log(`  - ${d.name} (${d.category}, ${d.region}, from INR ${d.startingPrice}) [slug: ${d.slug}]`);
    }

    await mongoose.disconnect();
    console.log('\nSeeding completed cleanly. Existing enquiries/users data untouched.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error instanceof Error ? error.message : error);
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
    process.exit(1);
  }
}

seed();

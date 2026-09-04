import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local if present
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

const ADMIN_EMAIL = (process.env.ADMIN_SEED_EMAIL || 'admin@gmail.com').toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'TravelAdmin@123';

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String, default: 'Admin', trim: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('Connected to MongoDB.');

    // Check if user already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    if (existing) {
      existing.password = hashedPassword;
      existing.role = 'admin';
      await existing.save();
      console.log(`Evaluator admin user (${ADMIN_EMAIL}) updated successfully with secure bcrypt hash.`);
    } else {
      await User.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Travel Admin',
        role: 'admin',
      });
      console.log(`Evaluator admin user (${ADMIN_EMAIL}) created successfully with secure bcrypt hash.`);
    }

    await mongoose.disconnect();
    console.log('Seeding completed cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed with error:', error.message || error);
    process.exit(1);
  }
}

seedAdmin();

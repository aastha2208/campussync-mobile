require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const Admin = require('../models/Admin');

async function seed() {
  const dataPath = path.join(__dirname, '../../seed-data/admins.json');
  if (!fs.existsSync(dataPath)) {
    console.error(
      `No seed-data/admins.json found. Copy seed-data/admins.example.json to ` +
      `seed-data/admins.json and fill in real passwords first (that file is ` +
      `gitignored — it never gets committed).`
    );
    process.exit(1);
  }

  const admins = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('[Seed] Connected to MongoDB');

  for (const a of admins) {
    const passwordHash = await bcrypt.hash(a.password, 10);
    await Admin.findOneAndUpdate(
      { email: a.email.toLowerCase() },
      {
        email: a.email.toLowerCase(),
        passwordHash,
        name: a.name,
        clubId: a.clubId,
        clubName: a.clubName,
      },
      { upsert: true, new: true }
    );
    console.log(`[Seed] Upserted ${a.email}`);
  }

  console.log(`[Seed] Done — ${admins.length} admin accounts seeded.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err);
  process.exit(1);
});

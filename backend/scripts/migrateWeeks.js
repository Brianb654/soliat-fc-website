// scripts/migrateWeeks.js
require('dotenv').config(); // Load .env variables
const mongoose = require('mongoose');
const Match = require('../models/Match');

async function migrateWeeks() {
  try {
    // Connect to your production DB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log("✅ Connected to MongoDB");

    const matches = await Match.find();

    for (const match of matches) {
      if (!match.seasonWeek) {
        // Example logic: set seasonWeek based on date
        const weekNumber = Math.ceil((match.date.getDate()) / 7); 
        match.seasonWeek = weekNumber;
        await match.save();
        console.log(`Updated match ${match._id} → week ${weekNumber}`);
      }
    }

    console.log("🎉 Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration error:", error);
    process.exit(1);
  }
}

migrateWeeks();

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  "mongodb+srv://palrahul95987_db_user:JsQNLd3f6pafDm52@cluster0.2fsot5z.mongodb.net/";

const DB_NAME = "terno_trip";

const users = [
  {
    name: "Terno Admin",
    email: "admin@terno.dev",
    password: "Admin@123456",
    role: "admin",
    isVerified: true,
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Terno Master",
    email: "master@terno.dev",
    password: "Master@123456",
    role: "master",
    isVerified: true,
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ MongoDB se connect ho gaye!");

    const db = client.db(DB_NAME);
    const collection = db.collection("users");

    for (const user of users) {
      const exists = await collection.findOne({ email: user.email });

      if (exists) {
        console.log(`⚠️  User already exists: ${user.email} — skipping`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 12);
      await collection.insertOne({ ...user, password: hashedPassword });
      console.log(`✅ User created: ${user.email} (${user.role})`);
    }

    console.log("\n🎉 Seed complete! Ab login karo:");
    console.log("   admin@terno.dev   / Admin@123456");
    console.log("   master@terno.dev  / Master@123456");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

seed();

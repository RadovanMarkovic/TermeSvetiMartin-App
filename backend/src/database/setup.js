import { dbPath } from "./db.js";
import { initializeDatabase } from "./schema.js";

async function setupDatabase() {
  await initializeDatabase();
  console.log(`SQLite database ready at ${dbPath}`);
}

setupDatabase().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exit(1);
});

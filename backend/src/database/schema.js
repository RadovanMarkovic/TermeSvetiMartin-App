import { all, closeDatabase, openDatabase, run } from "./db.js";

export async function initializeDatabase() {
  const db = openDatabase();

  try {
    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        avatar TEXT,
        main_interest TEXT,
        activity_preference TEXT,
        food_preference TEXT,
        reward_preference TEXT,
        morning_plan TEXT,
        afternoon_plan TEXT,
        evening_plan TEXT,
        selected_stations TEXT,
        selected_food_categories TEXT,
        activity_zone TEXT,
        activity_items TEXT,
        wellness_items TEXT,
        generated_perfect_day TEXT,
        language TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `
    );

    await run(
      db,
      `
      CREATE TABLE IF NOT EXISTS session_foods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        meal_type TEXT,
        food_name TEXT,
        food_category TEXT
      )
    `
    );

    await addColumnIfMissing(db, "session_foods", "meal_type", "TEXT");
    await addColumnIfMissing(db, "sessions", "selected_stations", "TEXT");
    await addColumnIfMissing(db, "sessions", "selected_food_categories", "TEXT");
    await addColumnIfMissing(db, "sessions", "activity_zone", "TEXT");
    await addColumnIfMissing(db, "sessions", "activity_items", "TEXT");
    await addColumnIfMissing(db, "sessions", "wellness_items", "TEXT");
    await addColumnIfMissing(db, "sessions", "generated_perfect_day", "TEXT");
  } finally {
    await closeDatabase(db).catch(() => {});
  }
}

async function addColumnIfMissing(db, tableName, columnName, columnType) {
  const columns = await all(db, `PRAGMA table_info(${tableName})`);
  const columnExists = columns.some((column) => column.name === columnName);

  if (!columnExists) {
    await run(db, `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
  }
}

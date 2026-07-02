import express from "express";
import cors from "cors";
import crypto from "node:crypto";
import { all, closeDatabase, openDatabase, run } from "./database/db.js";
import { initializeDatabase } from "./database/schema.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Smart Guest Quest API",
  });
});

app.get("/api/dashboard", async (req, res) => {
  const db = openDatabase();

  try {
    const totalRows = await all(db, "SELECT COUNT(*) AS total FROM sessions");
    const totalSessions = totalRows[0]?.total || 0;

    const [avatars, foods, mealTypeFoods, activities, rewards, responses] = await Promise.all([
      getBreakdown(db, "avatar", totalSessions),
      getFoodBreakdown(db, totalSessions),
      getMealTypeFoodBreakdown(db, totalSessions),
      getBreakdown(db, "activity_preference", totalSessions),
      getBreakdown(db, "reward_preference", totalSessions),
      getDetailedSessions(db),
    ]);

    const foodCategories = getArrayBreakdown(
      responses,
      "selectedFoodCategories",
      totalSessions
    );
    const activityZones = getArrayBreakdown(
      responses,
      "selectedActivityZones",
      totalSessions
    );
    const activityItems = getArrayBreakdown(
      responses,
      "selectedActivityItems",
      totalSessions
    );
    const wellnessItems = getArrayBreakdown(
      responses,
      "selectedWellnessItems",
      totalSessions
    );

    res.json({
      totalSessions,
      avatarBreakdown: avatars,
      foodCategories,
      breakfastPreferences: mealTypeFoods.breakfast,
      lunchPreferences: mealTypeFoods.lunch,
      dinnerPreferences: mealTypeFoods.dinner,
      foodPreferences: foods,
      activityZones,
      activityItems,
      wellnessPreferences: wellnessItems,
      activityPreferences: activities,
      rewardPreferences: rewards,
      recommendations: buildDashboardRecommendations({
        avatars,
        foods,
        foodCategories,
        activities: activityItems.length > 0 ? activityItems : activities,
        rewards: wellnessItems.length > 0 ? wellnessItems : rewards,
        activityZones,
      }),
      responses,
    });
  } catch (error) {
    console.error("Failed to load dashboard data:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data.",
    });
  } finally {
    await closeDatabase(db).catch(() => {});
  }
});

app.post("/api/sessions", async (req, res) => {
  const {
    avatar,
    mainInterest,
    activityPreference,
    foodPreference,
    rewardPreference,
    morningPlan,
    afternoonPlan,
    eveningPlan,
    selectedStations = [],
    selectedFoodCategories = [],
    selectedActivityZones = [],
    selectedActivityItems = [],
    selectedWellnessItems = [],
    generatedPerfectDay,
    selectedFoods = [],
    language,
  } = req.body;

  if (!avatar || !activityPreference || !foodPreference || !rewardPreference) {
    return res.status(400).json({
      success: false,
      message:
        "avatar, activityPreference, foodPreference, and rewardPreference are required.",
    });
  }

  if (!Array.isArray(selectedFoods)) {
    return res.status(400).json({
      success: false,
      message: "selectedFoods must be an array.",
    });
  }

  if (!Array.isArray(selectedStations)) {
    return res.status(400).json({
      success: false,
      message: "selectedStations must be an array.",
    });
  }

  const arrayFields = {
    selectedFoodCategories,
    selectedActivityZones,
    selectedActivityItems,
    selectedWellnessItems,
  };

  for (const [fieldName, fieldValue] of Object.entries(arrayFields)) {
    if (!Array.isArray(fieldValue)) {
      return res.status(400).json({
        success: false,
        message: `${fieldName} must be an array.`,
      });
    }
  }

  const sessionId = crypto.randomUUID();
  const db = openDatabase();

  try {
    await run(db, "BEGIN TRANSACTION");
    await run(
      db,
      `
      INSERT INTO sessions (
        session_id,
        avatar,
        main_interest,
        activity_preference,
        food_preference,
        reward_preference,
        morning_plan,
        afternoon_plan,
        evening_plan,
        selected_stations,
        selected_food_categories,
        activity_zone,
        activity_items,
        wellness_items,
        generated_perfect_day,
        language
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        sessionId,
        avatar,
        mainInterest || null,
        activityPreference,
        foodPreference,
        rewardPreference,
        morningPlan || null,
        afternoonPlan || null,
        eveningPlan || null,
        JSON.stringify(selectedStations),
        JSON.stringify(selectedFoodCategories),
        JSON.stringify(selectedActivityZones),
        JSON.stringify(selectedActivityItems),
        JSON.stringify(selectedWellnessItems),
        generatedPerfectDay || null,
        language || null,
      ]
    );

    for (const food of selectedFoods) {
      await run(
        db,
        `
        INSERT INTO session_foods (
          session_id,
          meal_type,
          food_name,
          food_category
        )
        VALUES (?, ?, ?, ?)
      `,
        [
          sessionId,
          food.mealType || food.meal_type || null,
          food.name || null,
          food.category || null,
        ]
      );
    }

    await run(db, "COMMIT");

    res.status(201).json({
      success: true,
      session_id: sessionId,
    });
  } catch (error) {
    await run(db, "ROLLBACK").catch(() => {});

    console.error("Failed to save session:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to save anonymous session.",
    });
  } finally {
    await closeDatabase(db).catch(() => {});
  }
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Smart Guest Quest backend running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  });

async function getBreakdown(db, column, totalSessions) {
  const allowedColumns = [
    "avatar",
    "food_preference",
    "activity_preference",
    "reward_preference",
  ];

  if (!allowedColumns.includes(column)) {
    throw new Error("Invalid dashboard column");
  }

  const rows = await all(
    db,
    `
    SELECT ${column} AS name, COUNT(*) AS count
    FROM sessions
    WHERE ${column} IS NOT NULL AND ${column} != ''
    GROUP BY ${column}
    ORDER BY count DESC, name ASC
  `
  );

  return rows.map((row) => ({
    name: row.name,
    count: row.count,
    percentage:
      totalSessions > 0 ? Math.round((row.count / totalSessions) * 100) : 0,
  }));
}

async function getFoodBreakdown(db, totalSessions) {
  const rows = await all(
    db,
    `
    SELECT food_name AS name, COUNT(*) AS count
    FROM session_foods
    WHERE food_name IS NOT NULL AND food_name != ''
    GROUP BY food_name
    ORDER BY count DESC, name ASC
  `
  );

  return rows.map((row) => ({
    name: row.name,
    count: row.count,
    percentage:
      totalSessions > 0 ? Math.round((row.count / totalSessions) * 100) : 0,
  }));
}

async function getMealTypeFoodBreakdown(db, totalSessions) {
  const rows = await all(
    db,
    `
    SELECT meal_type, food_name AS name, COUNT(*) AS count
    FROM session_foods
    WHERE food_name IS NOT NULL AND food_name != ''
      AND meal_type IS NOT NULL AND meal_type != ''
    GROUP BY meal_type, food_name
    ORDER BY meal_type ASC, count DESC, name ASC
  `
  );

  const groupedRows = {
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  for (const row of rows) {
    const mealKey = String(row.meal_type).toLowerCase();
    const item = {
      name: row.name,
      count: row.count,
      percentage:
        totalSessions > 0 ? Math.round((row.count / totalSessions) * 100) : 0,
    };

    if (mealKey.includes("breakfast")) {
      groupedRows.breakfast.push(item);
    } else if (mealKey.includes("lunch")) {
      groupedRows.lunch.push(item);
    } else if (mealKey.includes("dinner")) {
      groupedRows.dinner.push(item);
    }
  }

  return groupedRows;
}

async function getDetailedSessions(db) {
  const rows = await all(
    db,
    `
    SELECT
      s.session_id,
      s.avatar,
      s.main_interest,
      s.activity_preference,
      s.food_preference,
      s.reward_preference,
      s.morning_plan,
      s.afternoon_plan,
      s.evening_plan,
      s.selected_stations,
      s.selected_food_categories,
      s.activity_zone,
      s.activity_items,
      s.wellness_items,
      s.generated_perfect_day,
      s.language,
      s.created_at,
      f.meal_type,
      f.food_name,
      f.food_category
    FROM sessions s
    LEFT JOIN session_foods f ON f.session_id = s.session_id
    ORDER BY s.created_at DESC, s.id DESC, f.id ASC
    LIMIT 300
  `
  );

  const sessionsById = new Map();

  for (const row of rows) {
    if (!sessionsById.has(row.session_id)) {
      sessionsById.set(row.session_id, {
        sessionId: row.session_id,
        avatar: row.avatar,
        mainInterest: row.main_interest,
        activityPreference: row.activity_preference,
        foodPreference: row.food_preference,
        rewardPreference: row.reward_preference,
        morningPlan: row.morning_plan,
        afternoonPlan: row.afternoon_plan,
        eveningPlan: row.evening_plan,
        selectedStations: parseJsonArray(row.selected_stations),
        selectedFoodCategories: parseJsonArray(row.selected_food_categories),
        selectedActivityZones: parseJsonArray(row.activity_zone),
        selectedActivityItems: parseJsonArray(row.activity_items),
        selectedWellnessItems: parseJsonArray(row.wellness_items),
        generatedPerfectDay: row.generated_perfect_day,
        language: row.language,
        createdAt: row.created_at,
        foods: [],
      });
    }

    if (row.food_name) {
      sessionsById.get(row.session_id).foods.push({
        mealType: row.meal_type,
        name: row.food_name,
        category: row.food_category,
      });
    }
  }

  return [...sessionsById.values()];
}

function getArrayBreakdown(responses, fieldName, totalSessions) {
  const counts = new Map();

  for (const response of responses) {
    for (const value of response[fieldName] || []) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({
      name,
      count,
      percentage:
        totalSessions > 0 ? Math.round((count / totalSessions) * 100) : 0,
    }))
    .sort((first, second) => second.count - first.count || first.name.localeCompare(second.name));
}

function parseJsonArray(value) {
  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function buildDashboardRecommendations({ avatars, foods, activities, rewards }) {
  const recommendations = [];
  const topActivity = activities[0];
  const topFood = foods[0];
  const secondFood = foods[1];
  const wellnessAvatar = avatars.find((item) =>
    item.name.toLowerCase().includes("wellness")
  );
  const topReward = rewards[0];
  const lowFood = foods[foods.length - 1];

  if (topActivity?.name === "Cycling") {
    recommendations.push(
      "High interest in cycling activities. Promote cycling tours at reception."
    );
  } else if (topActivity) {
    recommendations.push(
      `High interest in ${topActivity.name.toLowerCase()}. Highlight this option in daily guest communication.`
    );
  }

  if (topFood && secondFood) {
    recommendations.push(
      `${topFood.name} and ${secondFood.name} are popular breakfast choices. Prepare higher quantities during busy periods.`
    );
  } else if (topFood) {
    recommendations.push(
      `${topFood.name} is the most popular food preference. Keep enough portions available.`
    );
  }

  if (wellnessAvatar && wellnessAvatar.percentage >= 20) {
    recommendations.push(
      "Wellness-related avatars are common. Promote spa and relaxation programs."
    );
  }

  if (topReward?.name === "Family Activity") {
    recommendations.push(
      "Family activities are a popular reward. Promote family-friendly resort programs."
    );
  }

  if (lowFood && foods.length > 1 && lowFood.percentage <= 10) {
    recommendations.push(
      `Low interest in ${lowFood.name.toLowerCase()} may indicate smaller preparation quantities are needed.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Collect more completed sessions to generate stronger operational recommendations."
    );
  }

  return recommendations;
}

import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.PROD_SUPABASE_DB_URI,
  ssl: { rejectUnauthorized: false }
});

app.get("/user-count", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cumulative_active_users 
       FROM private.active_user_growth_tracker 
       ORDER BY day DESC 
       LIMIT 1`
    );

    const count = result.rows[0].cumulative_active_users;

    res.json({ value: count });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000/user-count");
});

import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Production Supabase is IP-allowlisted to the Cruise Globe Dashboard's static IPs,
// so this app no longer connects to the database. It asks the dashboard's gateway
// for the number instead, and holds no database credentials.
const GATEWAY_URL = (process.env.CRUISE_GATEWAY_URL || "").replace(/\/+$/, "");
const TOKEN = process.env.GATEWAY_TOKEN_SMIIRL;

app.get("/user-count", async (req, res) => {
  if (!GATEWAY_URL || !TOKEN) {
    console.error("Gateway not configured: set CRUISE_GATEWAY_URL and GATEWAY_TOKEN_SMIIRL");
    return res.status(500).json({ error: "Failed to fetch user count" });
  }

  try {
    const r = await fetch(`${GATEWAY_URL}/api/gateway/smiirl/user-count`, {
      headers: { authorization: `Bearer ${TOKEN}` },
      signal: AbortSignal.timeout(8000),
    });
    const body = await r.json().catch(() => null);
    const value = Number(body?.value);

    if (!r.ok || body?.ok !== true || !Number.isFinite(value)) {
      throw new Error(`gateway ${r.status} ${body?.error ?? "unexpected response"}`);
    }

    res.json({ value });
  } catch (error) {
    console.error("Gateway error:", error.message);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000/user-count");
});

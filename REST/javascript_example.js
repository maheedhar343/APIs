/**
 * REST API Example (Node.js)
 * ---------------------------
 * Part A: A minimal REST server using Express exposing a weather resource.
 * Part B: A REST client using `fetch` that consumes the API.
 *
 * Install dependencies:
 *   npm install express
 */

// ---------------------------------------------------------------------------
// PART A: REST SERVER (Express)
// ---------------------------------------------------------------------------
const express = require("express");
const app = express();
app.use(express.json());

// In-memory "database" for demonstration
const WEATHER_DB = {
  hyderabad: { temperature_c: 29.4, humidity_percent: 68, condition: "Partly Cloudy" },
};
const FAVORITES_DB = {};

// Resource: forecast for a given city. Verb: GET (read-only)
app.get("/v1/cities/:city/forecast", (req, res) => {
  const city = req.params.city.toLowerCase();
  const data = WEATHER_DB[city];
  if (!data) return res.status(404).json({ error: "City not found" });
  res.status(200).json({ city, current: data });
});

// Resource: a user's favorite cities. Verb: POST (create)
app.post("/v1/users/:userId/favorites", (req, res) => {
  const { userId } = req.params;
  const { city } = req.body;
  FAVORITES_DB[userId] = FAVORITES_DB[userId] || [];
  FAVORITES_DB[userId].push(city);
  res.status(201).json({ user_id: userId, favorites: FAVORITES_DB[userId] });
});

app.listen(3000, () => console.log("REST server running on http://localhost:3000"));

// ---------------------------------------------------------------------------
// PART B: REST CLIENT (fetch)
// ---------------------------------------------------------------------------
const BASE_URL = "http://localhost:3000/v1";

async function getWeather(city) {
  const response = await fetch(`${BASE_URL}/cities/${city}/forecast`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function addToFavorites(userId, city) {
  const response = await fetch(`${BASE_URL}/users/${userId}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Example usage (run after the server above is listening):
// getWeather("hyderabad").then(console.log);
// addToFavorites(42, "hyderabad").then(console.log);

module.exports = { getWeather, addToFavorites };

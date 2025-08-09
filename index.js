const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = "./players.json";
const AUTH_KEY = "Buttersby";

app.use(cors());
app.use(express.json());

let players = {};
let saveEnabled = true; // 🔧 Toggle this at runtime!

if (fs.existsSync(DATA_FILE)) {
  players = JSON.parse(fs.readFileSync(DATA_FILE));
}

app.get("/", (req, res) => {
  const allPlayers = Object.values(players);
  res.json({
    saveEnabled,
    players: allPlayers
  });
});

app.get("/status", (req, res) => {
  res.json({ saveEnabled });
});

// ✅ Get individual player
app.get("/player/:id", (req, res) => {
  const playerId = req.params.id;
  const data = players[playerId];

  if (!data) {
    return res.status(404).json({ error: "Player not found" });
  }

  res.json(data);
});

app.post("/player", (req, res) => {
  const { playerId, playerName, score, completed, questionsCompleted, timeOfCompletion } = req.body;

  if (
    !playerId || 
    !Array.isArray(questionsCompleted) || 
    typeof completed !== "boolean" ||
    (timeOfCompletion && typeof timeOfCompletion !== "string")
  ) {
    return res.status(400).json({ error: "Invalid progress data" });
  }

  if (!saveEnabled) {
    return res.status(503).json({ error: "Saving is currently disabled" });
  }

  players[playerId] = {
    playerId,
    playerName: playerName || "",
    score: score || 0,
    completed,
    questionsCompleted,
    timeOfCompletion: timeOfCompletion || ""  // Add timeOfCompletion, default to empty string if missing
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
  res.json({ success: true });
});

// ✅ Toggle saving on/off
app.post("/toggle-save", (req, res) => {
  const { key, enabled } = req.body;

  if (key !== AUTH_KEY || typeof enabled !== "boolean") {
    return res.status(403).json({ error: "Forbidden or invalid payload" });
  }

  saveEnabled = enabled;
  res.json({ success: true, saveEnabled });
});

// ✅ Reset all data
app.delete("/reset", (req, res) => {
  const authKey = req.query.key;

  if (authKey !== AUTH_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  players = {};
  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
  res.json({ success: true, message: "All player data has been cleared." });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get("/export", (req, res) => {
  const authKey = req.query.key;
  if (authKey !== AUTH_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Make timestamped filename
  const dateStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const filename = `players_export_${dateStr}.txt`;

  // Tell the client it's a file download
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "text/plain");

  // Send the JSON directly
  res.send(JSON.stringify(players, null, 2));
});
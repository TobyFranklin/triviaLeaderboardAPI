const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = "./playerData.json";

let players = fs.existsSync(DATA_FILE)
  ? JSON.parse(fs.readFileSync(DATA_FILE))
  : [];

// GET all player scores (sorted)
app.get("/scores", (req, res) => {
  const topPlayers = players
    .filter(p => p.score !== undefined)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  res.json(topPlayers);
});

// GET individual player data
app.get("/player/:playerId", (req, res) => {
  const player = players.find(p => p.playerId === req.params.playerId);
  if (!player) return res.status(404).json({ error: "Player not found" });
  res.json(player);
});

// POST or update player data
app.post("/player", (req, res) => {
  const { playerId, initials, score, completed, answeredIndices } = req.body;

  if (
    typeof playerId !== "string" ||
    typeof initials !== "string" ||
    typeof score !== "number" ||
    typeof completed !== "boolean" ||
    !Array.isArray(answeredIndices)
  ) {
    return res.status(400).json({ error: "Invalid player data" });
  }

  const existing = players.find(p => p.playerId === playerId);
  if (existing) {
    existing.initials = initials;
    existing.score = score;
    existing.completed = completed;
    existing.answeredIndices = answeredIndices;
  } else {
    players.push({ playerId, initials, score, completed, answeredIndices });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Combined API running on port ${PORT}`);
});

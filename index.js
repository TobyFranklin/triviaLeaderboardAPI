const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = "./players.json";

app.use(cors());
app.use(express.json());

let players = {};
if (fs.existsSync(DATA_FILE)) {
  players = JSON.parse(fs.readFileSync(DATA_FILE));
}

// ✅ New: GET all player data as a list
app.get("/", (req, res) => {
  const allPlayers = Object.values(players);
  res.json(allPlayers);
});

// GET individual player progress
app.get("/player/:id", (req, res) => {
  const playerId = req.params.id;
  const data = players[playerId];

  if (!data) {
    return res.status(404).json({ error: "Player not found" });
  }

  res.json(data);
});

// POST (create/update) player progress
app.post("/player", (req, res) => {
  const { playerId, playerName, score, completed, questionsCompleted } = req.body;

  if (!playerId || !Array.isArray(questionsCompleted) || typeof completed !== "boolean") {
    return res.status(400).json({ error: "Invalid progress data" });
  }

  players[playerId] = {
    playerId,
    playerName: playerName || "",
    score: score || 0,
    completed,
    questionsCompleted
  };

  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
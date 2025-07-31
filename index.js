const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const SCORE_FILE = "./scores.json";

// Load scores (or initialize)
let scores = [];
if (fs.existsSync(SCORE_FILE)) {
  scores = JSON.parse(fs.readFileSync(SCORE_FILE));
}

app.get("/", (req, res) => {
  const topScores = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  res.json(topScores);
});

// GET leaderboard
app.get("/scores", (req, res) => {
  const topScores = scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
  res.json(topScores);
});

// POST new score
app.post("/submit", (req, res) => {
  const { name, score } = req.body;

  if (typeof name !== "string" || typeof score !== "number") {
    return res.status(400).json({ error: "Invalid score data" });
  }

  scores.push({ name, score });
  fs.writeFileSync(SCORE_FILE, JSON.stringify(scores, null, 2));

  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Leaderboard API listening on port ${PORT}`);
});
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({ message: "API working 🚀" });
});

app.post("/api/score", (req, res) => {
  const { tasks, referrals } = req.body;

  const score = tasks * 2 + referrals * 3;

  res.json({ score });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});


import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/decision", (req, res) => {
    const { tasks, referrals } = req.body;

    const baseRisk = 92;
    const impact = (referrals || 0) * 6 + (tasks || 0) * 4;
    const interactionBonus = ((referrals || 0) > 0 && (tasks || 0) > 0) ? 5 : 0;
    const adjustedImpact = (impact + interactionBonus) * (0.85 + Math.random() * 0.1);
    const risk = Math.max(30, Math.round(baseRisk - adjustedImpact));

    let insight = "";
    let action = "";

    if (!referrals && !tasks) {
      insight = "Complete inactivity detected. Immediate intervention required.";
      action = "Reactivation Campaign";
    } else if ((referrals || 0) > (tasks || 0) + 1) {
      insight = "Referral-driven engagement is strongest lever. Scale referral actions.";
      action = "Referral Drive";
    } else if ((tasks || 0) > (referrals || 0) + 1) {
      insight = "Content activity underperforming. Increase posting frequency.";
      action = "Content Push";
    } else {
      insight = "Balanced engagement detected. Combine referral and content strategies.";
      action = "Hybrid Campaign";
    }

    const variance = Math.random() * 2;
    const score = Math.max(0, Math.min(10, 6 + (impact / 10) - variance));

    res.json({
      score,
      risk,
      action,
      insight
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


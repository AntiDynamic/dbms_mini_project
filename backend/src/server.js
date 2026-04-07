import express from "express";
import "express-async-errors";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.js";
import skillsRouter from "./routes/skills.js";
import projectsRouter from "./routes/projects.js";
import searchRouter from "./routes/search.js";
import reportsRouter from "./routes/reports.js";
import auditRouter from "./routes/audit.js";
import dashboardRouter from "./routes/dashboard.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ message: "SkillMatch DB API running" });
});

app.use("/api/users", usersRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/search", searchRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/dashboard", dashboardRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error", details: err.message });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () => {
  console.log(`SkillMatch DB backend running on port ${port}`);
});

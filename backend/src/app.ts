import express from "express";

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
  res.json({
    message: "Kanban API running",
  });
});

export default app;
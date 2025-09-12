import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import adviceEntry from "./models/adviceEntry.js";


dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

mongoose.connect(process.env.MONGODB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => console.log("Connected to Mongo"));

app.use(cors());
app.use(express.json());

const logging = (req, _res, next) => {
  console.log(`${req.method} ${req.url} ${new Date().toLocaleString("en-us")}`);
  next();
};
app.use(logging);

app.get("/", (_req, res) => res.send("Welcome to Reframe It API"));

app.get("/status", (_req, res) => {
  res.json({ message: "Service healthy" });
});

// Advice CRUD
app.post("/api/advice", async (req, res) => {
  try {
    const doc = await adviceEntry.create({
      penName: req.body.penName ?? "",
      hurdle:  req.body.hurdle  ?? "",
      learned: req.body.learned ?? "",
      helps:   req.body.helps   ?? "",
      advice:  req.body.advice  ?? "",
      mood:    req.body.mood    ?? "",
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    });
    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create advice" });
  }
});

app.get("/api/advice", async (_req, res) => {
  try {
    const rows = await adviceEntry.find().sort({ createdAt: -1 }).limit(50);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to fetch advice" });
  }
});

app.get("/api/advice/:id", async (req, res) => {
  try {
    const row = await adviceEntry.findById(req.params.id);
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "invalid id" });
  }
});

// optional: helpful counter
app.post("/api/advice/:id/helpful", async (req, res) => {
  try {
    const row = await adviceEntry.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulCount: 1 } },
      { new: true }
    );
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "invalid id" });
  }
});

app.put("/api/advice/:id", async (req, res) => {
  try {
    const update = {};
    ["penName", "hurdle", "learned", "helps", "advice", "mood", "tags"].forEach(k => {
      if (typeof req.body[k] !== "undefined") update[k] = req.body[k];
    });
    const updated = await adviceEntry.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "invalid id or bad data" });
  }
});

app.delete("/api/advice/:id", async (req, res) => {
  try {
    const result = await adviceEntry.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "invalid id" });
  }
});

// Affirmations
app.get("/affirmation", async (_req, res) => {
  try {
    const r = await fetch("https://www.affirmations.dev/");
    res.status(r.ok ? 200 : 502).json(await r.json());
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch affirmation" });
  }
});

// Tarot
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tarotPath = path.join(__dirname, "data", "tarot.json");
let deck = [];
if (fs.existsSync(tarotPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(tarotPath, "utf8"));
    deck = Array.isArray(raw) ? raw : raw.cards || [];
  } catch (e) {
    console.error("Failed to load tarot.json:", e);
  }
}

app.get("/tarot", (_req, res) => res.json({ count: deck.length, cards: deck }));

app.get("/tarot/draw", (req, res) => {
  const count = Math.max(1, Math.min(10, Number(req.query.count) || 1));
  const allowReversed = String(req.query.reversed ?? "true") === "true";
  const pool = [...deck];
  const draw = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const [card] = pool.splice(idx, 1);
    draw.push({
      ...card,
      position: allowReversed && Math.random() < 0.45 ? "reversed" : "upright"
    });
  }
  res.json({ draw });
});

const server = app.listen(PORT, () => {
  console.log(`Listening on port ${server.address().port}`);
});

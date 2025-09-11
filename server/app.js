import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

dotenv.config();

// init
const app = express();
const PORT = process.env.PORT || 3000;

// --- Mongo ---
mongoose.connect(process.env.MONGODB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => console.log("✅ Successfully opened connection to Mongo!"));

// --- middleware ---
app.use(cors());
app.use(express.json());

// logging (kept from your class file)
const logging = (req, _res, next) => {
  console.log(`${req.method} ${req.url} ${new Date().toLocaleString("en-us")}`);
  next();
};
app.use(logging);

// --- base routes ---
app.get("/", (_req, res) => {
  res.send("Welcome to Reframe It API");
});

app.get("/status", (_req, res) => {
  res.json({ message: "Service healthy" });
});

// --- AFFIRMATIONS (proxy to avoid CORS) ---
app.get("/affirmation", async (_req, res) => {
  try {
    const r = await fetch("https://www.affirmations.dev/");
    const data = await r.json();
    res.status(r.ok ? 200 : 502).json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch affirmation" });
  }
});

// --- TAROT (local JSON) ---
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

app.get("/tarot", (_req, res) => {
  res.json({ count: deck.length, cards: deck });
});

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

// --- JOURNAL (Mongo) ---
const EntrySchema = new mongoose.Schema(
  {
    text: { type: String, default: "" },           // your note/reflection
    cards: { type: [Object], default: [] },        // tarot draw you saved
    mood: { type: String, default: "" },           // optional
    tags: { type: [String], default: [] }          // optional
  },
  { timestamps: true }
);

// force exact collection "journalentries"
const journalEntry =
  mongoose.models.journalEntry ||
  mongoose.model("journalEntry", EntrySchema, "journalentries");

// create entry
app.post("/api/journal", async (req, res) => {
  try {
    const doc = await journalEntry.create({
      text: req.body.text ?? "",
      cards: Array.isArray(req.body.cards) ? req.body.cards : [],
      mood: req.body.mood ?? "",
      tags: Array.isArray(req.body.tags) ? req.body.tags : []
    });
    res.status(201).json(doc);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to create entry" });
  }
});

// list recent entries
app.get("/api/journal", async (_req, res) => {
  try {
    const rows = await journalEntry.find().sort({ createdAt: -1 }).limit(20);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "failed to fetch entries" });
  }
});

// read one entry
app.get("/api/journal/:id", async (req, res) => {
  try {
    const row = await journalEntry.findById(req.params.id);
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(row);
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "invalid id" });
  }
});

// delete one entry
app.delete("/api/journal/:id", async (req, res) => {
  try {
    const result = await journalEntry.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "invalid id" });
  }
});

// --- start ---
const server = app.listen(PORT, () =>
  console.log(`🚀 Listening on port ${server.address().port}`)
);

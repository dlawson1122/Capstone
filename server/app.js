import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import adviceController from "./controllers/advice.js";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

mongoose.connect(process.env.MONGODB);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => console.log("Connected to Mongo"));

app.use(cors());
app.use(express.json());
app.use("/api/advice", adviceController);


const logging = (req, _res, next) => {
  console.log(`${req.method} ${req.url} ${new Date().toLocaleString("en-us")}`);
  next();
};
app.use(logging);

app.get("/", (_req, res) => res.send("Welcome to Reframe It API"));

app.get("/status", (_req, res) => {
  res.json({ message: "Service healthy" });
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

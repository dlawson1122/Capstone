// ---------- Helper ----------
const $ = (sel) => document.querySelector(sel);

// ---------- TAROT DECK (local JSON) ----------
let tarotDeck = [];

async function loadTarotDeck() {
  try {
    const res = await fetch("data/tarot-positive-78.json");
    if (!res.ok) throw new Error("Deck file not found");
    tarotDeck = await res.json();
  } catch (e) {
    console.error("Error loading deck:", e);
  }
}

function pickRandomCard() {
  return tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
}

function renderResult({ name, uprightText, reversedText, reversed }) {
  const orientation = reversed ? "Reversed" : "Upright";
  const meaning = reversed ? reversedText : uprightText;

  $("#result").innerHTML = `
    <div class="tarot-wrap">
      <div class="tarot-card">
        <div class="tarot-ribbon ${reversed ? "reversed" : ""}">${orientation}</div>
        <h3 class="card-title">${name}</h3>
        <div class="card-divider"></div>
        <p class="card-meaning">${meaning}</p>
        <span class="corner-bl">✶</span>
        <span class="corner-br">✶</span>
      </div>
    </div>
  `;
}

async function handleDraw() {
  const btn = $("#drawBtn");
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = "Drawing…";

  try {
    const raw = pickRandomCard();
    const reversed = Math.random() < 0.5; // 50/50 upright vs reversed
    renderResult({
      name: raw.name,
      uprightText: raw.meaning_up,
      reversedText: raw.meaning_rev,
      reversed
    });
  } catch (e) {
    $("#result").innerHTML = `
      <p>Couldn’t draw a card. Check <code>data/tarot-positive-78.json</code>.</p>
    `;
    console.error("Card draw failed:", e);
  } finally {
    btn.disabled = false;
    btn.textContent = "Draw Card";
  }
}

// ---------- API Affirmations ----------
async function fetchAffirmation() {
  const url = "https://www.affirmations.dev/";
  const res = await fetch("https://api.allorigins.win/get?url=" + encodeURIComponent(url));
  if (!res.ok) throw new Error("Affirmations API error");
  const data = await res.json();
  return JSON.parse(data.contents); // unwrap
}

function renderAffirmationCard(text) {
  const target = $("#affResult");
  if (!target) return;
  target.innerHTML = `
    <div class="affirm-wrap">
      <div class="affirm-card">
        <div class="affirm-ribbon">Affirmation</div>
        <h3 class="card-title">Daily Reframe</h3>
        <div class="card-divider"></div>
        <p class="card-meaning">${text}</p>
        <span class="corner-bl">✶</span>
        <span class="corner-br">✶</span>
      </div>
    </div>
  `;
}

async function handleAffirmation() {
  const btn = $("#affBtn");
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = "Fetching…";

  try {
    const data = await fetchAffirmation();
    renderAffirmationCard(data.affirmation || "You are doing better than you think.");
  } catch (e) {
    console.error("Affirmations API failed:", e);
    renderAffirmationCard("A gentle reminder: you’re resilient and resourceful.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Get Affirmation";
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", async () => {
  await loadTarotDeck();

  const drawBtn = $("#drawBtn");
  if (drawBtn) drawBtn.addEventListener("click", handleDraw);

  const affBtn = $("#affBtn");
  if (affBtn) affBtn.addEventListener("click", handleAffirmation);
});

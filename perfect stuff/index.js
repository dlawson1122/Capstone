// ---------- helpers ----------
const $ = (s) => document.querySelector(s);

function withTimeout(promise, ms = 8000) {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

// 50/50 upright vs reversed
const isReversed = () => Math.random() < 0.5;

// Local fallback if both APIs are down
const fallbackDeck = [
  { name: "The Fool", meaning_up: "Fresh start, spontaneity, a leap of faith.", meaning_rev: "Hesitation, recklessness, fear of the unknown." },
  { name: "The Magician", meaning_up: "Focused will, manifestation, skill.", meaning_rev: "Misuse of power, scattered energy, doubt." },
  { name: "The Star", meaning_up: "Hope, healing, alignment, renewal.", meaning_rev: "Disbelief, burnout, dimmed optimism." },
];

// ---------- rendering ----------
function renderResult({ name, uprightText, reversedText, reversed }) {
  const orientation = reversed ? "Reversed" : "Upright";
  const meaning = reversed ? reversedText : uprightText;

  document.querySelector("#result").innerHTML = `
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


// ---------- data sources ----------
async function getRandomCard() {
  // Primary: RWS Cards API (mirrored & stable)
  try {
    const res = await withTimeout(
      fetch("https://rws-cards-api.vercel.app/api/v1/cards/random?n=1")
    );
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    const c = Array.isArray(data?.cards) ? data.cards[0] : null;
    if (!c) throw new Error("shape mismatch");
    return {
      name: c.name,
      meaning_up: c.meaning_up,
      meaning_rev: c.meaning_rev || "Reversed perspective.",
    };
  } catch (_) {
    // continue to backup
  }

  // Backup: tarotapi.dev
  try {
    const res = await withTimeout(
      fetch("https://tarotapi.dev/api/v1/cards/random?n=1")
    );
    if (!res.ok) throw new Error("bad status");
    const data = await res.json();
    const c = Array.isArray(data?.cards) ? data.cards[0] : null;
    if (!c) throw new Error("shape mismatch");
    return {
      name: c.name,
      meaning_up: c.meaning_up,
      meaning_rev: c.meaning_rev || c.meaning_reverse || "Reversed perspective.",
    };
  } catch (_) {
    // fall through
  }

  // Fallback local deck
  return fallbackDeck[Math.floor(Math.random() * fallbackDeck.length)];
}

// ---------- event wiring ----------
async function handleDraw() {
  $("#drawBtn").disabled = true;
  $("#drawBtn").textContent = "Drawing…";

  try {
    const raw = await getRandomCard();
    const reversed = isReversed();

    renderResult({
      name: raw.name,
      uprightText: raw.meaning_up,
      reversedText: raw.meaning_rev,
      reversed,
    });
  } catch (err) {
    $("#result").innerHTML = `
      <p>Couldn’t reach the card service right now. Try again in a moment.</p>
    `;
    console.error(err);
  } finally {
    $("#drawBtn").disabled = false;
    $("#drawBtn").textContent = "Draw Card";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = $("#drawBtn");
  if (btn) btn.addEventListener("click", handleDraw);
});

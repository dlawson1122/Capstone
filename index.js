// Imports
import { header, nav, main, footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";
import deck from "./src/data/tarot-positive-78.json"; // direct import with Parcel

// Env Vars (Parcel reads .env into process.env at build time)
const AFFIRM_API = process.env.AFFIRMATION_API;
const CORS_PROXY = process.env.CORS_PROXY;

// Helpers
const $ = sel => document.querySelector(sel);

// Tarot
let tarotDeck = deck;

function pickRandomCard() {
  if (!tarotDeck?.length) throw new Error("Tarot deck is empty");
  return tarotDeck[Math.floor(Math.random() * tarotDeck.length)];
}

function renderResult({ name, uprightText, reversedText, reversed }) {
  const orientation = reversed ? "Reversed" : "Upright";
  const meaning = reversed ? reversedText : uprightText;

  const el = $("#result");
  if (!el) return;

  el.innerHTML = `
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
    const reversed = Math.random() < 0.5;
    renderResult({
      name: raw.name,
      uprightText: raw.meaning_up,
      reversedText: raw.meaning_rev,
      reversed
    });
  } catch (e) {
    const el = $("#result");
    if (el) {
      el.innerHTML = `<p>Couldn’t draw a card. Check the tarot deck JSON file.</p>`;
    }
    console.error("Card draw failed:", e);
  } finally {
    btn.disabled = false;
    btn.textContent = "Draw Card";
  }
}

// Affirmations
async function fetchAffirmation() {
  const url = `${AFFIRM_API}?t=${Date.now()}`;

  try {
    if (CORS_PROXY) {
      const res = await axios.get(`${CORS_PROXY}${encodeURIComponent(url)}`);
      return JSON.parse(res.data?.contents || "{}");
    } else {
      const res = await axios.get(url);
      return res.data;
    }
  } catch (e) {
    console.error("Affirmations API failed:", e);
    throw e;
  }
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
    renderAffirmationCard(
      data.affirmation || "You are doing better than you think."
    );
  } catch (e) {
    console.error("Affirmations API failed:", e);
    renderAffirmationCard(
      "A gentle reminder: you’re resilient and resourceful."
    );
  } finally {
    btn.disabled = false;
    btn.textContent = "Get Affirmation";
  }
}

// SPA Render
const router = new Navigo("/");

function render(state = store.home) {
  document.querySelector("#root").innerHTML = `
    ${header(state)}
    ${nav(store.nav)}
    ${main(state)}
    ${footer()}
  `;

  router.updatePageLinks();

  if (state.view === "daily") {
    const drawBtn = $("#drawBtn");
    const affBtn = $("#affBtn");
    if (drawBtn) drawBtn.addEventListener("click", handleDraw);
    if (affBtn) affBtn.addEventListener("click", handleAffirmation);
  }
  if (state.view === "journal") {
  const form = document.getElementById("journalForm");
  const entriesEl = document.getElementById("entries");

  // load existing
  fetch(`${process.env.API_BASE || "http://localhost:3000"}/api/journal`)
    .then(r => r.json())
    .then(items => {
      entriesEl.innerHTML = items.map(e => `
        <article class="entry" data-id="${e._id}">
          <h3>${e.mood || "📝"} ${e.title || "(untitled)"}</h3>
          <small>${new Date(e.createdAt).toLocaleString()}</small>
          <p style="white-space:pre-wrap">${e.body || e.text || ""}</p>
        </article>
      `).join("") || "<p>No entries yet.</p>";
    })
    .catch(() => entriesEl.innerHTML = "<p>Couldn’t load entries.</p>");

  // submit new
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;

      const payload = {
        title: form.title?.value?.trim() || "",
        body: form.body?.value?.trim() || "",
        mood: form.mood?.value || ""
      };

      try {
        const res = await fetch(`${process.env.API_BASE || "http://localhost:3000"}/api/journal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const created = await res.json();

        // prepend
        entriesEl.innerHTML = `
          <article class="entry" data-id="${created._id}">
            <h3>${created.mood || "📝"} ${created.title || "(untitled)"}</h3>
            <small>${new Date(created.createdAt).toLocaleString()}</small>
            <p style="white-space:pre-wrap">${created.body || created.text || ""}</p>
          </article>
        ` + entriesEl.innerHTML;

        form.reset();
      } catch (err) {
        console.error(err);
        alert("Saving failed.");
      } finally {
        btn.disabled = false;
      }
    });
  }
}

  const toggle = document.querySelector(".nav-toggle");
  const navEl = document.querySelector(".nav");
  if (toggle && navEl) {
    toggle.onclick = () => navEl.classList.toggle("open");
  }
}

// Router
router.notFound(() => render(store.viewNotFound));

router.on({
  "/": () => render(),
  "/:view": match => {
    const view = match?.data?.view ? camelCase(match.data.view) : "home";
    if (view in store) {
      render(store[view]);
    } else {
      render(store.viewNotFound);
      console.log(`View ${view} not defined`);
    }
  }
});

// Init
document.addEventListener("DOMContentLoaded", async () => {
  router.resolve();
});

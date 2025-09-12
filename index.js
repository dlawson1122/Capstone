// Imports
import { header, nav, main, footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";
import deck from "./src/data/tarot-positive-78.json"; // direct import with Parcel

// .Env Vars
const AFFIRM_API = process.env.AFFIRMATION_API;
const CORS_PROXY = process.env.CORS_PROXY;
const API = process.env.API_BASE || "http://localhost:3000";

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

// could have a card component - so we could have more than one card
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

 if (state.view === "advice") {
  const form = document.getElementById("adviceForm");
  const listEl = document.getElementById("adviceList"); // was "entries"

  // load existing
  fetch(`${API}/api/advice`)
    .then(r => r.json())
    .then(items => {
      listEl.innerHTML =
        items.map(e => `
          <article class="journal-card" data-id="${e._id}"> <!-- keep your existing card styles -->
            <div class="journal-ribbon">${e.penName || "Someone"}</div>
            <h3 class="card-title">${e.hurdle || "(untitled hurdle)"}</h3>
            <div class="card-divider"></div>
            <p class="card-meaning"><strong>What I learned:</strong> ${e.learned || ""}</p>
            <p class="card-meaning"><strong>How it helps:</strong> ${e.helps || ""}</p>
            <p class="card-meaning"><strong>Advice:</strong> ${e.advice || ""}</p>
            <span class="corner-bl">✶</span>
            <span class="corner-br">✶</span>
            <span class="entry-meta">
              ${new Date(e.createdAt).toLocaleString()}
              ${(e.tags && e.tags.length) ? ` • <em>${e.tags.join(", ")}</em>` : ""}
            </span>
            <button class="helpfulBtn" data-id="${e._id}">👍 Helpful (${e.helpfulCount || 0})</button>
          </article>
        `).join("") || "<p style='text-align:center'>No advice yet.</p>";

      // hook up Helpful buttons
      listEl.querySelectorAll(".helpfulBtn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.dataset.id;
          btn.disabled = true;
          try {
            const r = await fetch(`${API}/api/advice/${id}/helpful`, { method: "POST" });
            const updated = await r.json();
            btn.textContent = `👍 Helpful (${updated.helpfulCount || 0})`;
          } catch {
            alert("Couldn’t mark as helpful.");
          } finally {
            btn.disabled = false;
          }
        });
      });
    })
    .catch(() => (listEl.innerHTML = "<p>Couldn’t load advice.</p>"));

  // submit new
  if (form) {
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;

      const payload = {
        penName: form.penName?.value?.trim() || "",
        hurdle:  form.hurdle?.value?.trim()  || "",
        learned: form.learned?.value?.trim() || "",
        helps:   form.helps?.value?.trim()   || "",
        advice:  form.advice?.value?.trim()  || "",
        mood:    form.mood?.value || ""
      };

      try {
        const res = await fetch(`${API}/api/advice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const created = await res.json();

        // prepend
        listEl.innerHTML = `
          <article class="journal-card" data-id="${created._id}">
            <div class="journal-ribbon">${created.penName || "Someone"}</div>
            <h3 class="card-title">${created.hurdle || "(untitled hurdle)"}</h3>
            <div class="card-divider"></div>
            <p class="card-meaning"><strong>What I learned:</strong> ${created.learned || ""}</p>
            <p class="card-meaning"><strong>How it helps:</strong> ${created.helps || ""}</p>
            <p class="card-meaning"><strong>Advice:</strong> ${created.advice || ""}</p>
            <span class="corner-bl">✶</span>
            <span class="corner-br">✶</span>
            <span class="entry-meta">${new Date(created.createdAt).toLocaleString()}</span>
            <button class="helpfulBtn" data-id="${created._id}">👍 Helpful (0)</button>
          </article>
        ` + listEl.innerHTML;

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


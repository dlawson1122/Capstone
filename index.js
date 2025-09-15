// Imports
import { header, nav, main, footer } from "./components";
import * as store from "./store";
import Navigo from "navigo";
import { camelCase } from "lodash";
import axios from "axios";
import tarotDeckJson from "./src/data/tarot-positive-78.json"; // direct import with Parcel

// Environment Vars
const AFFIRM_API_URL = process.env.AFFIRMATION_API;
const CORS_PROXY_URL = process.env.CORS_PROXY;
const API_URL = process.env.API_BASE || "http://localhost:3000";

// DOM Helper
const selectElement = selector => document.querySelector(selector);

// Tarot
let tarotDeck = tarotDeckJson;

function getRandomCard() {
  if (!tarotDeck?.length) throw new Error("Tarot deck is empty");
  const randomIndex = Math.floor(Math.random() * tarotDeck.length);
  return tarotDeck[randomIndex];
}

function showCard({ name, uprightText, reversedText, reversed }) {
  const orientationLabel = reversed ? "Reversed" : "Upright";
  const meaningText = reversed ? reversedText : uprightText;

  const resultElement = selectElement("#result");
  if (!resultElement) return;

  resultElement.innerHTML = `
    <div class="tarot-wrap">
      <div class="tarot-card">
        <div class="tarot-ribbon ${reversed ? "reversed" : ""}">${orientationLabel}</div>
        <h3 class="card-title">${name}</h3>
        <div class="card-divider"></div>
        <p class="card-meaning">${meaningText}</p>
        <span class="corner-bl">✶</span>
        <span class="corner-br">✶</span>
      </div>
    </div>
  `;
}

async function drawCard() {
  const drawButton = selectElement("#drawBtn");
  if (!drawButton) return;

  drawButton.disabled = true;
  drawButton.textContent = "Drawing…";

  try {
    const randomCard = getRandomCard();
    const isReversed = Math.random() < 0.5;

    showCard({
      name: randomCard.name,
      uprightText: randomCard.meaning_up,
      reversedText: randomCard.meaning_rev,
      reversed: isReversed
    });
  } catch (error) {
    const resultElement = selectElement("#result");
    if (resultElement) {
      resultElement.innerHTML = `<p>Couldn’t draw a card. Check the tarot deck JSON file.</p>`;
    }
    console.error("Card draw failed:", error);
  } finally {
    drawButton.disabled = false;
    drawButton.textContent = "Draw Card";
  }
}

// Affirmations
async function getAffirmation() {
  const requestUrl = `${AFFIRM_API_URL}?t=${Date.now()}`;

  try {
    if (CORS_PROXY_URL) {
      const proxyResponse = await axios.get(
        `${CORS_PROXY_URL}${encodeURIComponent(requestUrl)}`
      );
      const proxiedJsonString = proxyResponse.data?.contents || "{}";
      return JSON.parse(proxiedJsonString);
    } else {
      const httpResponse = await axios.get(requestUrl);
      return httpResponse.data;
    }
  } catch (error) {
    console.error("Affirmations API failed:", error);
    throw error;
  }
}

function showAffirmation(affirmationText) {
  const affirmationElement = selectElement("#affResult");
  if (!affirmationElement) return;

  affirmationElement.innerHTML = `
    <div class="affirm-wrap">
      <div class="affirm-card">
        <div class="affirm-ribbon">Affirmation</div>
        <h3 class="card-title">Daily Reframe</h3>
        <div class="card-divider"></div>
        <p class="card-meaning">${affirmationText}</p>
        <span class="corner-bl">✶</span>
        <span class="corner-br">✶</span>
      </div>
    </div>
  `;
}

async function onAffirmationClick() {
  const affirmationButton = selectElement("#affBtn");
  if (!affirmationButton) return;

  affirmationButton.disabled = true;
  affirmationButton.textContent = "Fetching…";

  try {
    const affirmationApiData = await getAffirmation();
    showAffirmation(
      affirmationApiData.affirmation || "You are doing better than you think."
    );
  } catch (error) {
    console.error("Affirmations API failed:", error);
    showAffirmation("A gentle reminder: you’re resilient and resourceful.");
  } finally {
    affirmationButton.disabled = false;
    affirmationButton.textContent = "Get Affirmation";
  }
}

// SPA Render
const appRouter = new Navigo("/");
// wrapper so it reads as "updatePage"
const updatePage = () => appRouter.updatePageLinks();

function renderApp(currentState = store.home) {
  const rootElement = selectElement("#root");
  rootElement.innerHTML = `
    ${header(currentState)}
    ${nav(store.nav)}
    ${main(currentState)}
    ${footer()}
  `;

  updatePage();

  if (currentState.view === "daily") {
    const drawButton = selectElement("#drawBtn");
    const affirmationButton = selectElement("#affBtn");
    if (drawButton) drawButton.addEventListener("click", drawCard);
    if (affirmationButton) affirmationButton.addEventListener("click", onAffirmationClick);
  }

  if (currentState.view === "advice") {
    const adviceFormElement = document.getElementById("adviceForm");
    const adviceListElement = document.getElementById("adviceList");

    // load existing advice
    fetch(`${API_URL}/api/advice`)
      .then(fetchResponse => fetchResponse.json())
      .then((adviceItems = []) => {
        adviceListElement.innerHTML =
          adviceItems
            .map(adviceItem => `
              <article class="journal-card" data-id="${adviceItem._id}">
                <div class="journal-ribbon">${adviceItem.penName || "Someone"}</div>
                <h3 class="card-title">${adviceItem.hurdle || "(untitled hurdle)"}</h3>
                <div class="card-divider"></div>
                <p class="card-meaning"><strong>What I learned:</strong> ${adviceItem.learned || ""}</p>
                <p class="card-meaning"><strong>How it helps:</strong> ${adviceItem.helps || ""}</p>
                <p class="card-meaning"><strong>Advice:</strong> ${adviceItem.advice || ""}</p>
                <span class="corner-bl">✶</span>
                <span class="corner-br">✶</span>
                <span class="entry-meta">
                  ${new Date(adviceItem.createdAt).toLocaleString()}
                  ${(adviceItem.tags?.length) ? ` • <em>${adviceItem.tags.join(", ")}</em>` : ""}
                </span>
                <button class="helpfulBtn" data-id="${adviceItem._id}">
                  👍 Helpful (${adviceItem.helpfulCount || 0})
                </button>
              </article>
            `)
            .join("") || "<p style='text-align:center'>No advice yet.</p>";

        // hook up Helpful buttons
        adviceListElement.querySelectorAll(".helpfulBtn").forEach(helpfulButtonElement => {
          helpfulButtonElement.addEventListener("click", async () => {
            const adviceEntryId = helpfulButtonElement.dataset.id;
            helpfulButtonElement.disabled = true;
            try {
              const markHelpfulResponse = await fetch(
                `${API_URL}/api/advice/${adviceEntryId}/helpful`,
                { method: "POST" }
              );
              const updatedAdviceItem = await markHelpfulResponse.json();
              helpfulButtonElement.textContent = `👍 Helpful (${updatedAdviceItem.helpfulCount || 0})`;
            } catch {
              alert("Couldn’t mark as helpful.");
            } finally {
              helpfulButtonElement.disabled = false;
            }
          });
        });
      })
      .catch(() => {
        adviceListElement.innerHTML = "<p>Couldn’t load advice.</p>";
      });

    // submit new advice
    if (adviceFormElement) {
      adviceFormElement.addEventListener("submit", async submitEvent => {
        submitEvent.preventDefault();
        const submitButtonElement = adviceFormElement.querySelector('button[type="submit"]');
        submitButtonElement.disabled = true;

        const advicePayload = {
          penName: adviceFormElement.penName?.value?.trim() || "",
          hurdle:  adviceFormElement.hurdle?.value?.trim()  || "",
          learned: adviceFormElement.learned?.value?.trim() || "",
          helps:   adviceFormElement.helps?.value?.trim()   || "",
          advice:  adviceFormElement.advice?.value?.trim()  || "",
          mood:    adviceFormElement.mood?.value || ""
        };

        try {
          const createAdviceResponse = await fetch(`${API_URL}/api/advice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(advicePayload)
          });
          const createdAdviceItem = await createAdviceResponse.json();

          adviceListElement.innerHTML =
            `
              <article class="journal-card" data-id="${createdAdviceItem._id}">
                <div class="journal-ribbon">${createdAdviceItem.penName || "Someone"}</div>
                <h3 class="card-title">${createdAdviceItem.hurdle || "(untitled hurdle)"}</h3>
                <div class="card-divider"></div>
                <p class="card-meaning"><strong>What I learned:</strong> ${createdAdviceItem.learned || ""}</p>
                <p class="card-meaning"><strong>How it helps:</strong> ${createdAdviceItem.helps || ""}</p>
                <p class="card-meaning"><strong>Advice:</strong> ${createdAdviceItem.advice || ""}</p>
                <span class="corner-bl">✶</span>
                <span class="corner-br">✶</span>
                <span class="entry-meta">${new Date(createdAdviceItem.createdAt).toLocaleString()}</span>
                <button class="helpfulBtn" data-id="${createdAdviceItem._id}">👍 Helpful (0)</button>
              </article>
            ` + adviceListElement.innerHTML;

          adviceFormElement.reset();
        } catch (error) {
          console.error(error);
          alert("Saving failed.");
        } finally {
          submitButtonElement.disabled = false;
        }
      });
    }
  }

  const navToggleButton = selectElement(".nav-toggle");
  const navMenuElement = selectElement(".nav");
  if (navToggleButton && navMenuElement) {
    navToggleButton.onclick = () => navMenuElement.classList.toggle("open");
  }
}

// Router
appRouter.notFound(() => renderApp(store.viewNotFound));

appRouter.on({
  "/": () => renderApp(),
  "/:view": routeMatch => {
    const requestedView = routeMatch?.data?.view ? camelCase(routeMatch.data.view) : "home";
    if (requestedView in store) {
      renderApp(store[requestedView]);
    } else {
      renderApp(store.viewNotFound);
      console.log(`View ${requestedView} not defined`);
    }
  }
});

// Init
document.addEventListener("DOMContentLoaded", async () => {
  appRouter.resolve();
});

import html from "html-literal";
import heroImg from "url:../images/DrawTarotCard.jpg";
import tarotDeck from "../data/tarot-positive-78.json";

// pick a random card from the deck
function pickRandomCard() {
  const i = Math.floor(Math.random() * tarotDeck.length);
  return tarotDeck[i];
}

// create the Daily view
export default () => {
  const view = html`
    <main>
      <section class="hero">
        <img src="${heroImg}" alt="Draw a Tarot Card" />
      </section>

      <section>
        <h2>Card of the Day</h2>
        <p>Tap the button to draw a card and get a reframing insight.</p>
        <button id="drawBtn">Draw Card</button>
        <div id="result"></div>
      </section>

      <section>
        <h2>Affirmation</h2>
        <p>Tap for a quick, positive reframe.</p>
        <button id="affBtn">Get Affirmation</button>
        <div id="affResult"></div>
      </section>
    </main>
  `;

  // attach button behavior after the HTML is rendered
  setTimeout(() => {
    const drawBtn = document.getElementById("drawBtn");
    const resultEl = document.getElementById("result");
    if (drawBtn && resultEl) {
      drawBtn.addEventListener("click", () => {
        drawBtn.disabled = true;
        drawBtn.textContent = "Drawing…";

        try {
          const card = pickRandomCard();
          const reversed = Math.random() < 0.5;
          const orientation = reversed ? "Reversed" : "Upright";
          const meaning = reversed ? card.meaning_rev : card.meaning_up;

          resultEl.innerHTML = `
            <div class="tarot-wrap">
              <div class="tarot-card">
                <div class="tarot-ribbon ${reversed ? "reversed" : ""}">
                  ${orientation}
                </div>
                <h3 class="card-title">${card.name}</h3>
                <div class="card-divider"></div>
                <p class="card-meaning">${meaning}</p>
                <span class="corner-bl">✶</span>
                <span class="corner-br">✶</span>
              </div>
            </div>
          `;
        } catch (e) {
          console.error(e);
          resultEl.innerHTML = `<p>Couldn’t draw a card.</p>`;
        } finally {
          drawBtn.disabled = false;
          drawBtn.textContent = "Draw Card";
        }
      });
    }

    const affBtn = document.getElementById("affBtn");
    const affEl = document.getElementById("affResult");
    if (affBtn && affEl) {
      affBtn.addEventListener("click", async () => {
        affBtn.disabled = true;
        affBtn.textContent = "Fetching…";

        try {
          // use a simple public CORS proxy to call the API
          const res = await fetch(
            "https://api.allorigins.win/get?url=" +
              encodeURIComponent("https://www.affirmations.dev/")
          );
          const data = await res.json();
          const parsed = JSON.parse(data.contents);
          const text = parsed?.affirmation || "You are doing better than you think.";

          affEl.innerHTML = `
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
        } catch (e) {
          console.error(e);
          affEl.innerHTML = `<p>A gentle reminder: you’re resilient and resourceful.</p>`;
        } finally {
          affBtn.disabled = false;
          affBtn.textContent = "Get Affirmation";
        }
      });
    }
  }, 0);

  return view;
};

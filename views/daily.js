import html from "html-literal";
import heroImg from "url:../images/DrawTarotCard.jpg";
import tarotDeck from "../src/data/tarot-positive-78.json";

// pick a random card from the deck
function getRandomCardFromDeck() {
  const randomIndex = Math.floor(Math.random() * tarotDeck.length);
  return tarotDeck[randomIndex];
}

// create the Daily view
export default () => {
  const dailyView = html`
    <main>
      <section class="hero hero--daily">
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
    const drawButton = document.getElementById("drawBtn");
    const resultElement = document.getElementById("result");
    if (drawButton && resultElement) {
      drawButton.addEventListener("click", () => {
        drawButton.disabled = true;
        drawButton.textContent = "Drawing…";

        try {
          const selectedCard = getRandomCardFromDeck();
          const isReversed = Math.random() < 0.5;
          const cardOrientation = isReversed ? "Reversed" : "Upright";
          const cardMeaning = isReversed
            ? selectedCard.meaning_rev
            : selectedCard.meaning_up;

          resultElement.innerHTML = `
            <div class="tarot-wrap">
              <div class="tarot-card">
                <div class="tarot-ribbon ${isReversed ? "reversed" : ""}">
                  ${cardOrientation}
                </div>
                <h3 class="card-title">${selectedCard.name}</h3>
                <div class="card-divider"></div>
                <p class="card-meaning">${cardMeaning}</p>
                <span class="corner-bl">✶</span>
                <span class="corner-br">✶</span>
              </div>
            </div>
          `;
        } catch (error) {
          console.error(error);
          resultElement.innerHTML = `<p>Couldn’t draw a card.</p>`;
        } finally {
          drawButton.disabled = false;
          drawButton.textContent = "Draw Card";
        }
      });
    }

    const affirmationButton = document.getElementById("affBtn");
    const affirmationElement = document.getElementById("affResult");
    if (affirmationButton && affirmationElement) {
      affirmationButton.addEventListener("click", async () => {
        affirmationButton.disabled = true;
        affirmationButton.textContent = "Fetching…";

        try {
          // use a simple public CORS proxy to call the API
          const fetchResponse = await fetch(
            "https://api.allorigins.win/get?url=" +
              encodeURIComponent("https://www.affirmations.dev/")
          );
          const affirmationData = await fetchResponse.json();
          const parsedResponse = JSON.parse(affirmationData.contents);
          const affirmationText =
            parsedResponse?.affirmation ||
            "You are doing better than you think.";

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
        } catch (error) {
          console.error(error);
          affirmationElement.innerHTML = `<p>A gentle reminder: you’re resilient and resourceful.</p>`;
        } finally {
          affirmationButton.disabled = false;
          affirmationButton.textContent = "Get Affirmation";
        }
      });
    }
  }, 0);

  return dailyView;
};

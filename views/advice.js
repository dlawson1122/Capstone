import html from "html-literal";

export default state => html`
  <main>
    <section class="advice">
      <h2>Share what helped you</h2>

      <div class="advice-form">
        <div class="advice-ribbon">New Advice</div>
        <form id="adviceForm" style="display:grid; gap:12px; margin-top:8px">
          <input
            type="text"
            name="penName"
            placeholder="Your name (optional)"
          />

          <input
            type="text"
            name="hurdle"
            placeholder="What you overcame"
            required
          />

          <textarea
            name="learned"
            rows="3"
            placeholder="What you learned"
            required
          ></textarea>

          <textarea
            name="helps"
            rows="3"
            placeholder="How it helps (the reframe)"
            required
          ></textarea>

          <textarea
            name="advice"
            rows="3"
            placeholder="Advice to someone facing this"
            required
          ></textarea>

          <div
            style="display:flex; gap:12px; justify-content:center; align-items:center"
          >
            <select name="mood" title="Optional mood">
              <option value="">Mood</option>
              <option>🌞</option
              ><option>🙂</option
              ><option>😐</option
              ><option>🙁</option
              ><option>🌧️</option>
            </select>
            <button type="submit">Share</button>
          </div>
        </form>
      </div>

      <div id="adviceList" class="entries-stack"></div>
    </section>
  </main>
`;

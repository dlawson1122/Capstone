import html from "html-literal";

export default state => html`
  <main>
    <section class="journal">
      <h2>Journal</h2>

      <!-- Entry form styled like the tarot card -->
      <div class="journal-card">
        <div class="journal-ribbon">New Entry</div>
        <form id="journalForm" style="display:grid; gap:12px; margin-top:8px">
          <input type="text" name="title" placeholder="Title" required />
          <textarea
            name="body"
            placeholder="Write your reflection..."
            rows="5"
            required
          ></textarea>
          <div
            style="display:flex; gap:12px; justify-content:center; align-items:center"
          >
            <select name="mood">
              <option value="">Mood</option>
              <option>🌞</option
              ><option>🙂</option
              ><option>😐</option
              ><option>🙁</option
              ><option>🌧️</option>
            </select>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>

      <!-- Entries list -->
      <div id="entries" class="entries-stack"></div>
    </section>
  </main>
`;

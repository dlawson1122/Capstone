import html from "html-literal";

export default state => html`
  <main>
    <section class="journal">
      <h2>Journal</h2>
      <form id="journalForm">
        <input type="text" name="title" placeholder="Title" required />
        <textarea
          name="body"
          placeholder="Write your reflection..."
          required
        ></textarea>
        <select name="mood">
          <option value="">Mood</option>
          <option>🌞</option>
          <option>🙂</option>
          <option>😐</option>
          <option>🙁</option>
          <option>🌧️</option>
        </select>
        <button type="submit">Save</button>
      </form>
      <div id="entries"></div>
    </section>
  </main>
`;

import html from "html-literal";

export default state => html`
  <header class="site-header">
    <div class="brand">
      <h1>${state.header}</h1>
      <p class="tag">${state.tag}</p>
    </div>
  </header>
`;

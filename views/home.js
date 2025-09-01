import html from "html-literal";
import logo from "url:../images/logo.png";

export default () => html`
  <main>
    <section class="hero">
      <img src="${logo}" alt="Reframe your mindset logo" />
    </section>

    <section class="about-card">
      <h2>What Is Reframe It?</h2>
      <p>
        Rewrite the story. Reclaim your mind. Reframe It blends symbolic systems
        and science to help you rewire limiting beliefs into empowering
        narratives.
      </p>
    </section>

    <section class="about-card">
      <h2>Get Started</h2>
      <p>
        Visit <strong>Daily Insight</strong> to pull a positive tarot card and
        receive an uplifting affirmation. Each day gives you a fresh perspective
        and a chance to reset your story.
      </p>
    </section>
  </main>
`;

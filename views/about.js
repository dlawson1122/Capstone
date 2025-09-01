import html from "html-literal";
import heroImg from "url:../images/reframeIT.jpg";

export default () => html`
  <main>
    <section class="hero">
      <img src="${heroImg}" alt="Cosmic brain and tree illustration" />
    </section>

    <section class="about-card">
      <h2>Our Mission</h2>
      <p>
        Reframe It was created to give people a practical, uplifting way to shift
        their perspective. By blending symbolic traditions like Tarot with modern
        psychology and daily affirmations, we aim to help you rewire limiting
        beliefs into empowering ones.
      </p>
    </section>

    <section class="about-card">
      <h2>Why Reframing?</h2>
      <p>
        Reframing allows us to tell a different story about the same facts.
        Instead of being stuck in old loops, you can find meaning, hope, and
        growth in every experience. Our tools make this practice easy and
        accessible every day.
      </p>
    </section>
  </main>
`;

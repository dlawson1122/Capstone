import html from "html-literal";
import oopsImg from "url:../images/oops-404.jpg";

export default () => html`
  <main id="oops404">
    <h2>Oops! Page not found.</h2>
    <img src="${oopsImg}" alt="View not found!" />
    <p>
      Sorry, the page you’re looking for doesn’t exist.<br />
      Try going back to <a href="/home" data-navigo>Home</a>.
    </p>
  </main>
`;

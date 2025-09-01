import html from "html-literal";
import navItem from "./navItem";

export default navItems => html`
  <nav id="topNav" class="nav">
    <button class="nav-toggle" aria-expanded="false" aria-controls="primary-menu">
      <i class="fa-solid fa-bars"></i><span class="sr-only">Menu</span>
    </button>
    <ul id="primary-menu" class="menu">
      ${navItems.map(item => navItem(item)).join("")}
    </ul>
  </nav>
`;

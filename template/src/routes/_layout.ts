import { PageElement } from "@sahara/spa";

export default class BaseLayout extends PageElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="baselayout-main">
        <header class="baselayout-header">
          <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about/">About</a></li>
          </ul>
        </header>
        <main>
          <div id="slot"></div>
        </main>
        <footer class="baselayout-footer"></footer>
      </div>
    `;
  }
}

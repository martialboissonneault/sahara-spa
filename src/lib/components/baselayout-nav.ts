export default class BaseLayoutNav extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
        <!-- ⚠️ IMPORTANT: To target an index.ts file inside a folder, use either:
         - a trailing slash → /todos/
         - or explicitly → /todos/index -->
        <nav>
          <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/about/">About</a></li>
          </ul>
        </nav>
      `;
  }
}

customElements.define("baselayout-nav", BaseLayoutNav);

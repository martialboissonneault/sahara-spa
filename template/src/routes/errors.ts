import { PageElement } from "@sahara/spa";
import BaseLayout from "./_layout.ts";

export default class ErrorPage extends PageElement {
  static layout = BaseLayout;

  connectedCallback() {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || "Error";
    const msg = params.get("msg") || "An unexpected error occurred.";

    this.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 4rem;">
        <h1>${code}</h1>
        <p>${msg}</p>
        <a href="/">Back to Home</a>
      </div>
    `;
  }
}

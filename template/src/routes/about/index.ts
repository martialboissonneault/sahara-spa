import { PageElement } from "@sahara/spa";
import BaseLayout from "../_layout.ts";

export default class AboutIndexPage extends PageElement {
  static layout = BaseLayout;

  connectedCallback() {
    this.innerHTML = `
      <div class="container">
        <h1>About</h1>
        <p>Lorem ipsum dolor sit amet...</p>
      </div>
    `;
  }
}

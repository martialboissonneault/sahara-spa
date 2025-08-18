export default class ErrorIndexPage extends HTMLElement {
  connectedCallback() {
    const params = new URLSearchParams(location.search);
    const code = params.get("code") || "500";
    const msg = params.get("msg") || "An unknown error occurred.";

    this.innerHTML = `
          <section>
            <h1>Error ${code}</h1>
            <p>${msg}</p>
            <a href="/">← Back to Home</a>
          </section>
        `;
  }
}

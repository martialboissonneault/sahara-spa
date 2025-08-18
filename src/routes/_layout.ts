import "$lib/components/baselayout-nav";

/**
 * BaseLayout: Root layout for the application.
 *
 * Developers may customize the content of renderHeader() and renderFooter().
 * Do NOT modify the render() method or rename any of the render* functions.
 */
export default class BaseLayout extends HTMLElement {
  connectedCallback() {
    // Render the layout structure
    this.innerHTML = this.render();
  }

  /**
   * Customize header content here.
   * This method is the only place to modify header markup.
   */
  protected renderHeader(): string {
    return `
      <div class="baselayout-main">
        <div class="baselayout-header">
          <baselayout-nav></baselayout-nav>
        </div>
    `;
  }

  /**
   * Customize footer content here.
   * This method is the only place to modify footer markup.
   */
  protected renderFooter(): string {
    return `
        <div class="baselayout-footer">Footer</div>
      </div>
    `;
  }

  /**
   * Main render method: DO NOT modify this method or rename it.
   * It assembles header, slot placeholder, and footer in the correct order.
   */
  protected render(): string {
    return `
      ${this.renderHeader()}
      <div id="slot"></div>
      ${this.renderFooter()}
    `;
  }
}

/**
 * PageElement: Base class providing shorthand DOM querying and event binding.
 *
 * Usage in subclasses:
 *   this.$<HTMLButtonElement>('#btn-inc').textContent = '...';
 *   this.on<HTMLButtonElement, 'click'>('#btn-inc', 'click', () => { ... });
 */
export abstract class PageElement extends HTMLElement {
  /**
   * Shorthand for querySelector, throws if not found.
   * @returns the element cast to type T (defaults to HTMLElement)
   */
  protected $<T extends Element = HTMLElement>(selector: string): T {
    const el = this.querySelector(selector);
    if (!el) {
      throw new Error(`Element not found: ${selector}`);
    }
    return el as T;
  }

  /**
   * Shorthand for addEventListener on a selected element.
   * Supports any event type (click, submit, etc.).
   * @returns this for chaining
   */
  protected on<K extends keyof HTMLElementEventMap, T extends Element = HTMLElement>(selector: string, eventType: K, handler: (event: HTMLElementEventMap[K]) => void): this {
    this.$<T>(selector).addEventListener(eventType, handler as EventListener);
    return this;
  }
}

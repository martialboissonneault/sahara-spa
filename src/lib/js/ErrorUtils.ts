/**
 * Utility class for error navigation and ID validation.
 */
export class ErrorUtils {
  /**
   * Navigates to the shared /errors page with a specific HTTP-like code and optional message.
   *
   * Example:
   *   ErrorUtils.goTo(404, "User not found");
   *
   * This function updates the URL and triggers SPA routing.
   */
  static goTo(code: number, message?: string) {
    const path = `/errors?code=${code}${
      message ? `&msg=${encodeURIComponent(message)}` : ""
    }`;
    history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  /**
   * Validates a numeric ID from an attribute (must be > 0).
   * Returns the parsed number or null if invalid.
   */
  static getValidatedId(attr: string | null): number | null {
    const id = Number(attr);
    if (!Number.isInteger(id) || id <= 0) return null;
    return id;
  }

  /**
   * Validates a numeric ID that can be zero (>= 0).
   * Returns the parsed number or null if invalid.
   */
  static getValidatedIdAllowZero(attr: string | null): number | null {
    const id = Number(attr);
    if (!Number.isInteger(id) || id < 0) return null;
    return id;
  }
}

import { PageElement } from "$lib/js/PageElement.js";
import { Store } from "$lib/js/Store.js";
import { ErrorUtils } from "$lib/js/ErrorUtils.js";

// --- Public API ---
export { PageElement, Store, navigateTo };

const DEBUG = import.meta.env.DEV;
const app = document.getElementById("app")!;

// ——— Start SPA routing ———
startRouting();

function startRouting() {
  // Handle back/forward navigation
  window.addEventListener("popstate", loadPage);
  // Intercept link clicks for SPA navigation
  document.addEventListener("click", onLinkClick);
  // Initial page load
  loadPage();
}

function onLinkClick(e: MouseEvent) {
  // Ignore clicks with modifier keys (Ctrl, Cmd, etc.) or middle/right-click
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

  const a = (e.target as HTMLElement).closest('a[href^="/"]') as HTMLAnchorElement | null;

  // Ensure it's a valid internal link without special attributes (target, download, rel=external)
  if (a && a.target !== "_blank" && a.getAttribute("rel") !== "external" && !a.hasAttribute("download")) {
    // Prevent default browser navigation
    e.preventDefault();
    // Navigate only if the destination URL is different from the current one
    if (a.href !== window.location.href) {
      history.pushState({}, "", a.href);
      loadPage();
    }
  }
}

function navigateTo(path: string) {
  if (window.location.pathname !== path) {
    history.pushState({}, "", path);
    loadPage();
  }
}

async function loadPage() {
  if (DEBUG) console.log("→ Loading", window.location.pathname);
  if (!app) return;
  // Clear previous content
  app.innerHTML = "";

  try {
    // 1. Dynamically import the page module
    const file = routeToFile(window.location.pathname);
    const mod = await import(/* @vite-ignore */ file);
    const PageClass = mod.default as CustomElementConstructor;
    // 2. Collect nested layout constructors
    const layouts: CustomElementConstructor[] = [];
    let LayoutCtor = (PageClass as any).layout as CustomElementConstructor | undefined;
    while (LayoutCtor) {
      layouts.unshift(LayoutCtor);
      LayoutCtor = (LayoutCtor as any).layout;
    }
    // 3. Define custom elements for layouts and the page
    for (const ctor of [...layouts, PageClass]) {
      const suffix = layouts.includes(ctor) ? "Layout" : "Page";
      const tag = tagName(ctor.name, suffix as "Layout" | "Page");
      if (!customElements.get(tag)) {
        customElements.define(tag, ctor);
      }
    }
    // 4. Mount nested layouts into the DOM
    let container: Element = app;
    for (const LayoutClass of layouts) {
      const tag = tagName(LayoutClass.name, "Layout");
      const layoutEl = document.createElement(tag);
      container.appendChild(layoutEl);
      await nextFrame();
      // Drill down into its slot for the next element
      container = layoutEl.querySelector("#slot")!;
    }
    // 5. Inject the final page element
    const pageTag = tagName(PageClass.name, "Page");
    const pageEl = document.createElement(pageTag);
    container.replaceWith(pageEl);
    await nextFrame();
  } catch (err) {
    if (DEBUG) console.error("❌ loadPage error:", err);
    // Check if the error is a module loading error (likely 404)
    if (err instanceof Error && err.message.includes("Failed to fetch dynamically imported module")) {
      ErrorUtils.goTo(404, "Page not found");
    } else {
      ErrorUtils.goTo(500, "Could not load page");
    }
  }
}

// Generate a kebab-case tag name from a class name and suffix
function tagName(klassName: string, suffix: "Page" | "Layout"): string {
  return (
    klassName
      .replace(new RegExp(suffix + "$"), "")
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .toLowerCase() + `-${suffix.toLowerCase()}`
  );
}

// Convert a route path to the corresponding file path
function routeToFile(route: string): string {
  const path = route.startsWith("/") ? route : `/${route}`;
  if (path === "/") return "/src/routes/index.ts";
  const isDir = route.endsWith("/");
  const clean = path.replace(/^\/|\/$/g, "");
  const parts = clean.split("/");
  const file = (isDir ? "index" : parts.pop()!) + ".ts";
  const subPath = parts.length > 0 ? `${parts.join("/")}/` : "";
  return `/src/routes/${subPath}${file}`;
}

// Wait for the next animation frame
const nextFrame = () => new Promise(requestAnimationFrame);

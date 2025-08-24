# Sahara SPA

[![npm version](https://img.shields.io/npm/v/@martialboissonneault/sahara-spa.svg)](https://www.npmjs.com/package/@martialboissonneault/sahara-spa)
[![build](https://github.com/martialboissonneault/sahara-spa/actions/workflows/build.yml/badge.svg)](https://github.com/martialboissonneault/sahara-spa/actions)
[![license](https://img.shields.io/npm/l/@martialboissonneault/sahara-spa)](https://github.com/martialboissonneault/sahara-spa/blob/main/LICENSE)

A minimal, file-based routing framework for building Single Page Applications (SPAs) with native Web Components. It is built with Vite and TypeScript, offering a lightweight and modern development experience.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)

  - [1. File-Based Routing](#1-file-based-routing)
  - [2. Layouts](#2-layouts)
  - [3. Creating a Page](#3-creating-a-page)
  - [4. The PageElement Helper Class](#4-the-pageelement-helper-class)
  - [5. State Management](#5-state-management)

- [License](#license)

---

## Getting Started

The recommended way to start a new project is by using `npx`, which ensures you are always using the latest version of the scaffolding tool.

Run the following command in your terminal:

```bash
npx sahara-spa create my-app
cd my-app
npm install
npm run dev
```

---

## Core Concepts

Sahara SPA is built around a few key ideas designed to simplify web development while giving you **full control**.

Unlike many modern frameworks that hide complexity behind layers of abstractions or rely on heavy dependencies, Sahara SPA is deliberately minimal. It is written in **vanilla JavaScript and TypeScript** and leverages **native Web Components**, meaning:

- No “black box” magic — you can read and understand all parts of the framework.
- Zero runtime dependencies: your app runs on standards that are already in the browser.
- TypeScript provides **type safety and autocompletion** without compromising simplicity.
- The mental model stays close to the web platform itself, making debugging and reasoning straightforward.

This philosophy ensures that developers stay close to the underlying technologies (DOM, Custom Elements, ES modules) while still benefiting from modern conveniences like routing, layouts, and reactive state.

---

### 1. File-Based Routing

The URL of a page is determined by its file path within the `src/routes` directory. The router automatically maps URLs to the corresponding component files.

- `src/routes/index.ts` → `/`
- `src/routes/about.ts` → `/about`
- `src/routes/todos/index.ts` → `/todos/`
- `src/routes/todos/new.ts` → `/todos/new`

---

### 2. Layouts

Layouts are special components that wrap your pages, allowing you to share common UI elements like headers, footers, or sidebars across multiple routes.

- A layout is defined in a `_layout.ts` file.
- A layout can be placed in any directory inside `src/routes`.
- If no `_layout.ts` file exists in a subdirectory, the layout from the nearest parent directory is used.

**Default Root Layout (`/routes/_layout.ts`)**

```typescript
export default class BaseLayout extends HTMLElement {
  connectedCallback() {
    this.innerHTML = this.render();
  }
  protected renderHeader(): string {
    return `
        <h1>Header layout /routes/_layout.ts</h1>
    `;
  }
  protected renderFooter(): string {
    return `
      	<h1>Footer layout /routes/_layout.ts</h1>
    `;
  }
  /**
   * Main render method: DO NOT modify this method or rename it.
   */
  protected render(): string {
    return `
      ${this.renderHeader()}
      <div id="slot"></div>
      ${this.renderFooter()}
    `;
  }
}
```

**Assigning a Layout to a Page**

```typescript
import BaseLayout from "$routes/_layout";
export default class TodosIndexPage extends PageElement {
  static layout = BaseLayout;
  //more code...
}
```

#### Nested Layouts

You can nest layouts infinitely. For example, a `/routes/admin/` directory can have its own layout that extends the root one:

```typescript
import BaseLayout from "$routes/_layout";
export default class AdminLayout extends BaseLayout {
  static layout = BaseLayout;
  protected renderHeader(): string {
    return `
        <h2>Header layout /routes/admin/_layout.ts</h2>
    `;
  }
  protected renderFooter(): string {
    return `
        <h2>Footer layout /routes/admin/_layout.ts</h2>
    `;
  }
}
```

And `/routes/admin/stats/_layout.ts` can extend `AdminLayout`:

```typescript
import AdminLayout from "$routes/admin/_layout";
export default class StatsLayout extends AdminLayout {
  static layout = AdminLayout;
  protected renderHeader(): string {
    return `
        <h3>Header layout /routes/admin/stats/_layout.ts</h3>
      `;
  }
  protected renderFooter(): string {
    return `
        <h3>Footer layout /routes/admin/stats/_layout.ts</h3>
      `;
  }
}
```

Resulting rendering:

```
<h1>Header layout /routes/_layout.ts</h1>
  <h2>Header layout /routes/admin/_layout.ts</h2>
    <h3>Header layout /routes/admin/stats/_layout.ts</h3>
      ...page content...
    <h3>Footer layout /routes/admin/stats/_layout.ts</h3>
  <h2>Footer layout /routes/admin/_layout.ts</h2>
<h1>Footer layout /routes/_layout.ts</h1>
```

#### Independent Layouts

Layouts can also be fully independent, without inheriting from a parent:

```typescript
export default class IndependentLayout extends HTMLElement {
  connectedCallback() {
    this.innerHTML = this.render();
  }
  protected renderHeader(): string {
    return `
        <h1>Header layout /routes/admin/dashboard/_layout.ts</h1>
    `;
  }
  protected renderFooter(): string {
    return `
      	<h1>Footer layout /routes/admin/dashboard/_layout.ts</h1>
    `;
  }
  protected render(): string {
    return `
      ${this.renderHeader()}
      <div id="slot"></div>
      ${this.renderFooter()}
    `;
  }
}
```

---

### 3. Creating a Page

Create a new file in the `src/routes` directory. The file must export a default class that represents the page component. You can extend either the provided `PageElement` helper class from the `@sahara/spa` package for extra conveniences, or extend the standard HTMLElement

**`src/routes/index.ts`**

```typescript
import BaseLayout from "$routes/_layout";
import { PageElement, Store } from "@sahara/spa";

export default class SamplePage extends PageElement {
  // Assigns the layout that will wrap this page.
  static layout = BaseLayout;

  /**
   * Called by the browser when the component is inserted into the DOM.
   * This is the best place to run setup code.
   */
  connectedCallback() {
    this.renderTemplate();
    this.fetchData(); // Fetch data after the template is ready.
    this.bindEvents();
  }

  /**
   * Injects the component's HTML structure.
   */
  private renderTemplate() {
    this.innerHTML = `
      <div id="data-container"></div>
    `;
  }

  /**
   * Fetches data from an API and updates the DOM.
   */
  private async fetchData() {
    // TODO: Place your API call here.
    // Example:
    // const response = await fetch('https://api.example.com/data');
    // const data = await response.json();
    // this.$('#data-container').innerHTML = `... render data ...`;
  }

  /**
   * Binds event listeners to interactive elements.
   */
  private bindEvents() {
    // Handles click on #btn1.
    this.on("#btn1", "click", () => {
      // Logic for click event.
    });

    // Handles form submission on #btn2.
    this.on("#btn2", "submit", async (e) => {
      e.preventDefault();
      // Logic for submit event.
    });
  }
}
```

---

### 4. The `PageElement` Helper Class

While page components can extend the standard `HTMLElement`, Sahara SPA provides a convenient base class, `PageElement`, which offers useful shortcuts to simplify DOM interactions and ensure type safety with TypeScript.

#### Typed DOM Querying with `this.$()`

```typescript
// Standard way (verbose and unsafe):
const counterDiv = this.querySelector("#div-counter") as HTMLDivElement | null;
if (counterDiv) {
  counterDiv.textContent = `${this.state.count}`;
}

// With PageElement:
this.$("#div-counter").textContent = `${this.state.count}`;
```

You can also explicitly specify the element type:

```typescript
// Works with full type support (e.g. forms)
this.$<HTMLFormElement>("#myForm").reset();
```

#### Simplified Event Handling with `this.on()`

```typescript
// Increment the counter on button click
this.on("#btn-inc", "click", () => {
  this.state.count++;
});
```

All event listeners attached with `this.on()` are **automatically removed** when the component is disconnected from the DOM, preventing memory leaks without any manual cleanup code.

---

### 5. State Management

Sahara SPA includes a simple `Store` utility for managing state within your components. It provides two methods for creating observable state objects. When a property on a state object is modified, any registered callbacks are automatically triggered.

#### In-Memory State (Regular)

Use `Store.observe()` for temporary state that is reset when the user navigates away or refreshes the page.

**Example: A simple counter**

```typescript
import { PageElement, Store } from "@sahara/spa";

export default class MyPage extends PageElement {
  // The state is lost on page refresh
  private state = Store.observe<{ count: number }>({ count: 0 });

  connectedCallback() {
    this.state.onChange("count", (newCount) => {
      // This code runs every time `state.count` changes
      console.log(`The count is now: ${newCount}`);
    });
  }
}
```

#### Persistent State

Use `Store.observePersistent()` to create state that is automatically saved to the browser's `localStorage`. The state will be preserved even if the user closes the tab or browser. You must provide a unique key for the `localStorage`.

**Example: A persistent counter**

```typescript
// The state is saved to localStorage under the key "home-counter"
private state = Store.observePersistent<{ count: number }>({ count: 0 }, "home-counter");
```

**Example: Managing a collection (Todo List)**

```typescript
interface Todo {
  id: number;
  text: string;
  done: boolean;
}

// The list of todos will be saved to localStorage under the key "my-todo-list"
private state = Store.observePersistent<{ todos: Todo[] }>({ todos: [] }, "my-todo-list");
```

---

## License

This project is licensed under the [MIT License](./LICENSE).

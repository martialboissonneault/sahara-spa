# Sahara SPA

[![npm version](https://img.shields.io/npm/v/@martialboissonneault/sahara-spa.svg)](https://www.npmjs.com/package/@martialboissonneault/sahara-spa)
[![build](https://github.com/martialboissonneault/sahara-spa/actions/workflows/build.yml/badge.svg)](https://github.com/martialboissonneault/sahara-spa/actions)
[![license](https://img.shields.io/github/license/martialboissonneault/sahara-spa.svg)](https://github.com/martialboissonneault/sahara-spa/blob/main/LICENSE)

A minimal, file-based routing framework for building Single Page Applications (SPAs) with native Web Components. It is built with Vite and TypeScript, offering a lightweight and modern development experience.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
  - [1. File-Based Routing](#1-file-based-routing)
  - [2. State Management](#2-state-management)
  - [3. Layouts](#3-layouts)
  - [4. The PageElement Helper Class](#4-the-pageelement-helper-class)
- [Usage Examples](#usage-examples)
  - [Creating a Page](#creating-a-page)
  - [How to Create a Layout](#how-to-create-a-layout)
  - [Nested Layouts](#nested-layouts)
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

### 2. State Management

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
    this.state.onChange("count", () => {
      // This code runs every time `state.count` changes
      console.log(`The count is now: ${this.state.count}`);
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

### 3. Layouts

Layouts are special components that wrap your pages, allowing you to share common UI elements like headers, footers, or sidebars across multiple routes.

- A layout is defined in a `_layout.ts` file.
- A layout can be placed in any directory inside `src/routes`.
- Pages or other layouts within the same directory (or subdirectories) can use it.

---

### 4. The `PageElement` Helper Class

While page components can extend the standard `HTMLElement`, Sahara SPA provides a convenient base class, `PageElement`, which offers useful shortcuts to simplify DOM interactions and ensure type safety with TypeScript.

#### Typed DOM Querying with `this.$()`

`this.$()` is a strongly-typed shorthand for `querySelector()`. It ensures the element exists (throws if not found) and provides proper IntelliSense and type-checking.

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

`this.on()` combines `querySelector()` and `addEventListener()` into a single, concise call.  
It is fully typed, so the event handler knows exactly which event type is expected.

```typescript
// Increment the counter on button click
this.on("#btn-inc", "click", () => {
  this.state.count++;
});
```

This keeps event wiring clean and consistent across components.

---

## Usage Examples

### Creating a Page

Create a new file in the `src/routes` directory. The file must export a default class that extends `PageElement` from the `@sahara/spa` package.

**`src/routes/index.ts`**

```typescript
import { PageElement } from "@sahara/spa";
import BaseLayout from "./_layout.ts"; // Import the layout with a relative path

export default class IndexPage extends PageElement {
  // Statically assign the layout for this page
  static layout = BaseLayout;

  connectedCallback() {
    this.innerHTML = `<h1>Welcome Home!</h1>`;
  }
}
```

---

## How to Create a Layout

Create a `_layout.ts` file. A layout component must also extend `PageElement` and must contain an element with `id="slot"` where the child page or layout will be rendered.

**`src/routes/_layout.ts` (Root Layout)**

```typescript
import { PageElement } from "@sahara/spa";

export default class BaseLayout extends PageElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <nav><a href="/">Home</a> <a href="/about/">About</a></nav>
      </header>
      <main>
        <div id="slot"></div>
      </main>
      <footer>...</footer>
    `;
  }
}
```

---

### Nested Layouts

Layouts can be nested. For example, you can have a general site layout and a specific layout for a "dashboard" section.

A child layout specifies its parent layout in the same way a page does: with a `static layout` property.

**`src/routes/dashboard/_layout.ts` (Dashboard Layout)**

```typescript
import { PageElement } from "@sahara/spa";
import RootLayout from "../_layout.ts"; // Import the root layout with a relative path

export default class DashboardLayout extends PageElement {
  // This layout will be rendered inside BaseLayout's slot
  static layout = RootLayout;

  connectedCallback() {
    this.innerHTML = `
      <aside>Dashboard Sidebar</aside>
      <div class="dashboard-content">
        <div id="slot"></div>
      </div>
    `;
  }
}
```

Any page inside `src/routes/dashboard/` can now use `DashboardLayout`, and it will be automatically wrapped by `BaseLayout` as well. This structure provides a powerful and flexible way to organize your application's UI.

---

## License

This project is licensed under the [MIT License](./LICENSE).

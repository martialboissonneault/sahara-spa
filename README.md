# Sahara SPA

A minimal, file-based routing framework for building Single Page Applications (SPAs) with native Web Components. It is built with Vite and TypeScript, offering a lightweight and modern development experience.

## Getting Started

To create a new Sahara SPA project, run the following command:

```bash
npx sahara-spa create my-app
cd my-app
npm install
npm run dev
```

## Core Concepts

Sahara SPA is built around two main ideas: file-based routing and nested layouts.

### 1. File-Based Routing

The URL of a page is determined by its file path within the `src/routes` directory. The router automatically maps URLs to the corresponding component files.

- `src/routes/index.ts` → `/`
- `src/routes/about.ts` → `/about`
- `src/routes/todos/index.ts` → `/todos/`
- `src/routes/todos/new.ts` → `/todos/new`

## State Management

Sahara SPA includes a simple `Store` utility for managing state within your components. It provides two methods for creating observable state objects. When a property on a state object is modified, any registered callbacks are automatically triggered.

### In-Memory State (Regular)

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

### Persistent State

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

### 2. Layouts

Layouts are special components that wrap your pages, allowing you to share common UI elements like headers, footers, or sidebars across multiple routes.

- A layout is defined in a `_layout.ts` file.
- A layout can be placed in any directory inside `src/routes`.
- Pages or other layouts within the same directory (or subdirectories) can use it.

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

import BaseLayout from "$routes/_layout";
import { Store } from "$lib/js/Store";
import { ErrorUtils } from "$lib/js/ErrorUtils";
import { PageElement } from "$lib/js/PageElement";

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

/**
 * Renders the Todo List demo page.
 * This component demonstrates state management, event handling, and dynamic rendering.
 */
export default class TodosPage extends PageElement {
  static layout = BaseLayout;

  // Use persistent state to save the todo list in localStorage.
  // The key "sahara-spa-todos-demo" ensures the data is unique to this demo.
  private state = Store.observePersistent<{ todos: Todo[] }>({ todos: [] }, "sahara-spa-todos-demo");

  /**
   * Lifecycle method called when the component is added to the DOM.
   * It orchestrates the initial setup.
   */
  connectedCallback() {
    this.renderTemplate();
    this.bindEvents();

    // Subscribe to changes in the 'todos' state property.
    // Whenever `this.state.todos` is modified, this callback will run.
    this.state.onChange("todos", (todos: Todo[]) => {
      this.renderTodoList(todos);
    });

    // Perform the initial render of the list with the current state.
    this.renderTodoList(this.state.todos);
  }

  /**
   * Sets up the static HTML structure of the page.
   */
  private renderTemplate() {
    this.innerHTML = `
      <div class="container">
        <h1>Todo List Demo</h1>
        <form id="add-todo-form" class="form-container">
          <fieldset>
            <legend>New Todo</legend>
            <div class="form-group">
              <input type="text" name="todoText" placeholder="What needs to be done?" required />
            </div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Add Todo</button>
            </div>
          </fieldset>
        </form>
        <ul id="todo-list" class="todo-list-container"></ul>
      </div>
    `;
  }

  /**
   * Binds all necessary event listeners for the page.
   */
  private bindEvents(): void {
    // Handle the submission of the "add todo" form.
    this.on("#add-todo-form", "submit", (e) => {
      e.preventDefault();

      const form = e.currentTarget as HTMLFormElement;
      const data = this.getFormData("#add-todo-form");
      const text = data.todoText?.trim();

      if (text) {
        // Create a new todo object with a unique ID (using the current timestamp)
        // and default `done` status to false.
        const newTodo: Todo = { id: Date.now(), text, done: false };
        // To trigger the reactive update, we create a *new* array containing all
        // the old todos plus the new one, and assign it back to the state.
        this.state.todos = [...this.state.todos, newTodo];
        form.reset(); // Clear the form input.
      }
    });

    // Use event delegation to handle clicks on the entire list.
    // This is more efficient than adding a listener to every single list item.
    this.on("#todo-list", "click", (e) => {
      const target = e.target as HTMLElement;

      // Find the parent `<li>` element to get its `data-id`.
      const li = target.closest<HTMLLIElement>("li[data-id]");
      if (!li) return;

      // Safely get and validate the todo ID from the data attribute.
      const todoId = ErrorUtils.getValidatedId(li.dataset.id ?? null);
      if (todoId === null) return;

      // If the checkbox was clicked, toggle the 'done' state of the corresponding todo.
      if (target.matches('input[type="checkbox"]')) {
        this.state.todos = this.state.todos.map((todo) => (todo.id === todoId ? { ...todo, done: !todo.done } : todo));
      }

      // If the delete button was clicked, remove the todo from the state.
      if (target.matches(".btn-delete")) {
        this.state.todos = this.state.todos.filter((todo) => todo.id !== todoId);
      }
    });
  }

  private renderTodoList(todos: Todo[]) {
    // Get the container for the list.
    const list = this.$("#todo-list");

    // If there are no todos, display a helpful message.
    if (todos.length === 0) {
      list.innerHTML = `<li><p><em>No todos yet. Add one above!</em></p></li>`;
      return;
    }

    // Otherwise, map over the todos array to generate an HTML string for each item,
    // then join them together and set the list's innerHTML.
    list.innerHTML = todos
      .map(
        (todo) => `
        <li data-id="${todo.id}" class="${todo.done ? "done" : ""}">
          <label>
            <input type="checkbox" ${todo.done ? "checked" : ""}>
            <span>${todo.text}</span>
          </label>
          <button class="btn-delete">&times;</button>
        </li>
      `
      )
      .join("");
  }
}

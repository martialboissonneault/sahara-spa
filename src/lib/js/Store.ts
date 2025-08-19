/**
 * Callback invoked when a property changes.
 * @param newValue The new value of the property.
 */
type Listener<T, K extends keyof T> = (newValue: T[K]) => void;

/**
 * A generic listener type for internal use.
 */
type AnyListener = (newValue: any) => void;

/**
 * Observable<T>: T extended with onChange capability.
 */
export type Observable<T extends object> = T & {
  /**
   * Register a callback for changes to property key.
   */
  onChange<K extends keyof T>(key: K, callback: Listener<T, K>): void;
};

export class Store {
  /**
   * Creates an in-memory observable object. State is lost on page refresh.
   * - property get/set operations trigger notifications
   * - exposes onChange(key, callback)
   * @param target The initial state object.
   */
  static observe<T extends object>(target: T): Observable<T> {
    const listeners = new Map<keyof T, AnyListener[]>();

    const notify = (key: keyof T, value: T[keyof T]) => {
      const cbs = listeners.get(key);
      if (cbs) {
        cbs.forEach((cb) => cb(value));
      }
    };

    const proxy = new Proxy(target, {
      set(obj, prop: string | symbol, value: any, receiver: any) {
        const result = Reflect.set(obj, prop as keyof T, value, receiver);
        // Notify only if property belongs to target
        if (typeof prop === "string" && (prop as keyof T) in obj) {
          notify(prop as keyof T, value);
        }
        return result;
      },
    }) as Observable<T>;

    // Attach onChange method to proxy
    proxy.onChange = <K extends keyof T>(key: K, callback: Listener<T, K>) => {
      if (!listeners.has(key)) {
        listeners.set(key, []);
      }
      listeners.get(key)!.push(callback as AnyListener);
    };

    return proxy;
  }

  /**
   * Creates an observable object and persists it to localStorage.
   * State is preserved across page refreshes.
   * - property get/set operations trigger notifications
   * - exposes onChange(key, callback)
   * - automatically loads from and saves to localStorage
   * @param target The initial state object.
   * @param storageKey The key to use for localStorage.
   */
  static observePersistent<T extends object>(target: T, storageKey: string): Observable<T> {
    const listeners = new Map<keyof T, AnyListener[]>();

    // 1) Load persisted state if available
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<T>;
        Object.assign(target, parsed);
      }
    } catch {
      // ignore JSON errors
    }

    const notify = (key: keyof T, value: T[keyof T]) => {
      const cbs = listeners.get(key);
      if (cbs) cbs.forEach((cb) => cb(value));
      // Persist entire state on any change
      try {
        localStorage.setItem(storageKey, JSON.stringify(proxy));
      } catch {
        // ignore storage errors
      }
    };

    const proxy = new Proxy(target, {
      set(obj, prop: string | symbol, value: any, receiver: any) {
        const result = Reflect.set(obj, prop as keyof T, value, receiver);
        // Notify only if property belongs to target
        if (typeof prop === "string" && (prop as keyof T) in obj) {
          notify(prop as keyof T, value);
        }
        return result;
      },
    }) as Observable<T>;

    proxy.onChange = <K extends keyof T>(key: K, callback: Listener<T, K>) => {
      if (!listeners.has(key)) listeners.set(key, []);
      listeners.get(key)!.push(callback as AnyListener);
    };

    return proxy;
  }
}

/**
 * Callback invoked when a property changes.
 */
type Callback = () => void;

/**
 * Observable<T>: T extended with onChange capability.
 */
export type Observable<T extends object> = T & {
  /**
   * Register a callback for changes to property key.
   */
  onChange(key: keyof T, callback: Callback): void;
};

export class Store {
  /**
   * Creates an observable object:
   * - property get/set operations trigger notifications
   * - exposes onChange(key, callback)
   */
  static observe<T extends object>(target: T): Observable<T> {
    const listeners = new Map<keyof T, Callback[]>();

    const notify = (key: keyof T) => {
      const cbs = listeners.get(key);
      if (cbs) {
        cbs.forEach((cb) => cb());
      }
    };

    const proxy = new Proxy(target, {
      get(obj, prop: string | symbol, receiver) {
        const value = Reflect.get(obj, prop, receiver);
        // Recursively observe nested objects
        if (typeof value === "object" && value !== null) {
          return Store.observe(value as object);
        }
        return value;
      },
      set(obj, prop: string | symbol, value: any, receiver: any) {
        const result = Reflect.set(obj, prop as keyof T, value, receiver);
        // Notify only if property belongs to target
        if (typeof prop === "string" && (prop as keyof T) in obj) {
          notify(prop as keyof T);
        }
        return result;
      },
    }) as Observable<T>;

    // Attach onChange method to proxy
    proxy.onChange = (key: keyof T, callback: Callback) => {
      if (!listeners.has(key)) {
        listeners.set(key, []);
      }
      listeners.get(key)!.push(callback);
    };

    return proxy;
  }
}

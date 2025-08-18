/// <reference types="vite/client" />

declare global {
  interface Window {
    jwt?: string;
  }
}

// So that TS recognizes this module
export {};

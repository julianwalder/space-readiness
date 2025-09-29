// Polyfills for Node.js environment
// This file must be imported before any modules that use DOMMatrix or DOMPoint

if (typeof globalThis.DOMMatrix === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = class DOMMatrix {
    constructor(_init?: string | number[]) {
      // Simple polyfill for DOMMatrix
    }
  };
}

if (typeof globalThis.DOMPoint === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMPoint = class DOMPoint {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    x: number;
    y: number;
    z: number;
    w: number;
  };
}

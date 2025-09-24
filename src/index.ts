/**
 * __PKG_INFO__
 */

if (typeof __IS_DEV__ === 'undefined') {
  Reflect.set(globalThis, '__IS_DEV__', true);
}

export { default as funcMacro } from './func.js';
export { default } from './func.js';
export type { FuncMacroOptions } from './interfaces.js';

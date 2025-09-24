# rollup-plugin-func-macro 🚀

> Using `__func__` like C++ to get current function name (ignores arrow function context) ✨

[![npm version](https://img.shields.io/npm/v/rollup-plugin-func-macro.svg)](https://www.npmjs.com/package/rollup-plugin-func-macro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

For more awesome packages, check out [my homepage💛](https://baendlorel.github.io/?repoType=npm)

## What is this? 🤔

This Rollup plugin transforms `__func__` identifiers into the actual function name strings, similar to C++'s `__func__`(theoretically `__func__` is not a C++ macro)! Perfect for debugging, logging, and error tracking. (´∀｀)

## Features ⭐

- 🎯 **Smart Context Detection**: Finds the correct function name even in nested contexts
- 🏹 **Arrow Function Aware**: Skips arrow functions and finds the nearest named function
- 🎨 **Customizable**: Configure your own identifier, file patterns, and fallback values
- 🔧 **TypeScript Ready**: Full TypeScript support out of the box
- ⚡ **Fast**: Uses Acorn for efficient AST parsing

## Installation 📦

```bash
npm install --save-dev rollup-plugin-func-macro
# or
pnpm add -D rollup-plugin-func-macro
```

> 🎯 **TypeScript Support**: After installation, you can add `import 'rollup-plugin-func-macro'` in your global.d.ts file. Then `__func__` will be available in your projects with full type support! ✨

## Usage 🛠️

### Basic Setup

```js
// rollup.config.js
import funcMacro from 'rollup-plugin-func-macro';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
  plugins: [
    funcMacro({
      identifier: '__func__', // Custom identifier (default: '__func__')
      include: ['**/*.js', '**/*.ts'], // Files to transform (default)
      exclude: ['node_modules/**'], // Files to exclude (default)
      fallback: identifier, // Fallback when no function found (default is equal to identifier)
    }),
  ],
};
```

## Supported Function Types 📋

- ✅ **Function Declarations**: `function myFunc() {}`
- ✅ **Function Expressions**: `const func = function named() {}`
- ✅ **Class Methods**: `class { myMethod() {} }`
- ❌ **Arrow Functions**: `() => {}` (intentionally skipped)

### Why ? 🤷‍♀️

Arrow functions are often anonymous or used as short callbacks. This plugin focuses on meaningful, debuggable function names that you'd actually want to see in logs! (｡◕‿◕｡)

## Examples 💡

### Function Declarations

**Input:**

```js
function myAwesomeFunction() {
  console.log('Current function: __func__');
}
```

**Output:**

```js
function myAwesomeFunction() {
  console.log('Current function:', 'myAwesomeFunction');
}
```

### Class Methods

**Input:**

```js
class Logger {
  logMessage() {
    console.log(`[__func__] Hello world!`);
  }
}
```

**Output:**

```js
class Logger {
  logMessage() {
    console.log(`["logMessage"] Hello world!`);
  }
}
```

### String Replacement ✨

**NEW!** By default, `__func__` inside string literals and template literals will also be replaced! 🎉

**Input:**

```js
function debugFunction() {
  console.log('Debug: __func__ started');
  console.log(`Function __func__ with ${param}`);
  const name = __func__; // Still works as identifier
}
```

**Output:**

```js
function debugFunction() {
  console.log('Debug: debugFunction started');
  console.log(`Function debugFunction with ${param}`);
  const name = 'debugFunction';
}
```

You can disable this behavior by setting `stringReplace: false` in options. (◕‿◕)

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

MIT © [Kasukabe Tsumugi](mailto:futami16237@gmail.com)

---

Made with ❤️

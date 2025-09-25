# rollup-plugin-func-macro 🚀

> Using `__func__` like C++ to get current function name (ignores arrow function context) ✨

[![npm version](https://img.shields.io/npm/v/rollup-plugin-func-macro.svg)](https://www.npmjs.com/package/rollup-plugin-func-macro) [![npm downloads](http://img.shields.io/npm/dm/rollup-plugin-func-macro.svg)](https://npmcharts.com/compare/rollup-plugin-func-macro,token-types?start=1200&interval=30)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/59dd6795e61949fb97066ca52e6097ef)](https://www.codacy.com/app/Borewit/rollup-plugin-func-macro?utm_source=github.com&utm_medium=referral&utm_content=Borewit/rollup-plugin-func-macro&utm_campaign=Badge_Grade)

🎉 **Stable Release v1.0** - Production ready with comprehensive bug fixes and enhanced features!

**Core Capabilities:**

- 🎯 **Dynamic Method Names**: Supports computed property methods like `['dynamicMethod'](){ ... }`
- 🔀 **Variable Embedding**: Replace `__func__` anywhere in expressions and assignments
- 📝 **String Replacement**: Automatically replaces `__func__` inside string literals and template strings

For more awesome packages, check out [my homepage💛](https://baendlorel.github.io/?repoType=npm)

## What is this? 🤔

This Rollup plugin transforms `__func__` identifiers into the actual function name strings, similar to C++'s `__func__`(theoretically `__func__` is not a C++ macro)! Perfect for debugging, logging, and error tracking. (´∀｀)

## Features ⭐

- 🎯 **Smart Context Detection**: Finds the correct function name even in nested contexts
- 🏹 **Arrow Function Aware**: Skips arrow functions and finds the nearest named function
- 🌟 **Dynamic Method Support**: Handles computed property methods like `class { ['methodName']() {} }`
- 🔗 **Universal Variable Embedding**: Replace `__func__` in any expression context - assignments, concatenations, template expressions
- 📝 **Advanced String Processing**: Automatic replacement in string literals, template literals, and template expressions
- 🎨 **Customizable**: Configure your own identifier, file patterns, and fallback values
- 🔧 **TypeScript Ready**: Full TypeScript support out of the box
- ⚡ **Fast**: Uses Acorn for efficient AST parsing

## Installation 📦

```bash
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
      stringReplace: true, // Whether to replace inside string literals (default: true)
    }),
  ],
};
```

> `node_modules` is always excluded.

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

### Dynamic Method Names 🆕

**Input:**

```js
class ApiHandler {
  ['handleUserRequest']() {
    console.log('Executing:', __func__);
    return `Processing in ${__func__}`;
  }

  ['process' + 'Data']() {
    const methodName = __func__;
    console.log(`Method: ${methodName}`);
  }
}
```

**Output:**

```js
class ApiHandler {
  ['handleUserRequest']() {
    console.log('Executing:', 'handleUserRequest');
    return `Processing in handleUserRequest`;
  }

  ['process' + 'Data']() {
    const methodName = 'processData';
    console.log(`Method: processData`);
  }
}
```

### Variable Embedding in Expressions 🆕

**Input:**

```js
function debugFunction(param) {
  const name = __func__ + '_v2';
  const message = 'Function ' + __func__ + ' called';
  const result = { method: __func__, param };

  if (__func__ === 'debugFunction') {
    console.log(`Confirmed: ${__func__}`);
  }
}
```

**Output:**

```js
function debugFunction(param) {
  const name = 'debugFunction' + '_v2';
  const message = 'Function debugFunction called';
  const result = { method: 'debugFunction', param };

  if ('debugFunction' === 'debugFunction') {
    console.log(`Confirmed: debugFunction`);
  }
}
```

### Advanced String & Template Processing ✨

**Enhanced!** `__func__` replacement now works in all string contexts - string literals, template literals, and template expressions! 🎉

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

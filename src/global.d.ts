declare const __IS_DEV__: boolean;

interface FuncMacroOptions {
  /** The identifier to replace with function name, defaults to '__func__' */
  identifier: string;
  /** Files to include, defaults to `[✳️✳️/✳️.js, ✳️✳️/✳️.ts]` */
  include: string | string[];
  /** Files to exclude, defaults to `[node_modules/✳️✳️]` */
  exclude: string | string[];
  /** Fallback value when function name cannot be found, defaults to 'unknown' */
  fallback: string;
}

interface FunctionContext {
  name: string;
  type: 'FunctionDeclaration' | 'FunctionExpression' | 'MethodDefinition';
  start: number;
  end: number;
}

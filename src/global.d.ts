export {};

declare global {
  /**
   * ## Usage
   * use `__func__` in your code to get the current function name.
   *
   * __PKG_INFO__
   */
  const __func__: string;

  interface FuncMacroOptions {
    /**
     * The identifier to replace with function name
     * - defaults to '__func__'
     */
    identifier: '__func__' | '__FUNCTION__' | (string & {});

    /**
     * Fallback value when function name cannot be found
     * - defaults to `identifier`
     */
    fallback: string;

    /**
     * Files to include, defaults to `[✳️✳️/✳️.js, ✳️✳️/✳️.ts]`
     */
    include: string | string[];

    /**
     * Files to exclude, defaults to `[node_modules/✳️✳️]`
     */
    exclude: string | string[];
  }
}

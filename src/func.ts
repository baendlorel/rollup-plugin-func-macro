import { Plugin } from 'rollup';
import { createFilter } from '@rollup/pluginutils';
import { replaceIdentifiers } from './replace.js';
import { normalize } from './options.js';

/**
 * ## Usage
 * use `funcMacro()` in your Rollup configuration to enable the plugin.
 *
 * detailed infomation can be found in the type definition of `options`.
 *
 * __PKG_INFO__
 */
export function funcMacro(options?: Partial<FuncMacroOptions>): Plugin {
  const { identifier, include, exclude, fallback, stringReplace } = normalize(options);

  const filter = createFilter(include, exclude);

  return {
    name: 'func-macro',

    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      // Check if the code contains our identifier
      if (!code.includes(identifier)) {
        return null;
      }

      const transformedCode = replaceIdentifiers(code, identifier, fallback, stringReplace);

      if (transformedCode === code) {
        return null;
      }

      return {
        code: transformedCode,
        map: null, // For simplicity, not generating source maps
      };
    },
  };
}

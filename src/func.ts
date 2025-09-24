import { Plugin } from 'rollup';
import { createFilter } from '@rollup/pluginutils';
import { replaceIdentifiers } from './core/replace.js';
import { normalize } from './core/options.js';

/**
 * ## Usage
 * use `funcMacro()` in your Rollup configuration to enable the plugin.
 *
 * detailed infomation can be found in the type definition of `options`.
 *
 * __PKG_INFO__
 */
export function funcMacro(options?: Partial<FuncMacroOptions>): Plugin {
  const opts = normalize(options);

  const filter = createFilter(opts.include, opts.exclude);

  return {
    name: 'func-macro',
    transform(code: string, id: string) {
      if (!filter(id)) {
        return null;
      }

      // Check if the code contains our identifier
      if (!code.includes(opts.identifier)) {
        return null;
      }

      // Check if the code contains our identifier
      if (!code.includes(opts.identifier)) {
        return null;
      }

      const transformed = replaceIdentifiers(
        code,
        opts.identifier,
        opts.fallback,
        opts.stringReplace
      );

      return transformed === code ? null : { code: transformed, map: null };
    },
  };
}

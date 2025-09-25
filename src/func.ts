import { basename } from 'node:path';
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

      const filename = basename(id);
      let changed = false;
      let result = code;

      // Check if the code contains our function identifier
      if (code.includes(opts.identifier)) {
        const transformed = replaceIdentifiers(
          result,
          opts.identifier,
          opts.fallback,
          opts.stringReplace
        );
        if (transformed !== result) {
          result = transformed;
          changed = true;
        }
      }

      // Check if the code contains our file identifier
      if (code.includes(opts.fileIdentifier)) {
        const transformed = replaceIdentifiers(
          result,
          opts.fileIdentifier,
          filename,
          opts.stringReplace
        );
        if (transformed !== result) {
          result = transformed;
          changed = true;
        }
      }

      return changed ? { code: result, map: null } : null;
    },
  };
}

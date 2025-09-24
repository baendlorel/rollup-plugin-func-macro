import { Plugin } from 'rollup';
import { createFilter } from '@rollup/pluginutils';
import { replaceIdentifiers } from './replace.js';
import { normalize } from './options.js';

/**
 * Rollup plugin for function macro replacement
 */
export function funcMacro(options?: Partial<FuncMacroOptions>): Plugin {
  const {
    identifier = '__func__',
    include = ['**/*.js', '**/*.ts'],
    exclude = ['node_modules/**'],
    fallback = 'unknown',
  } = normalize(options);

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

      const transformedCode = replaceIdentifiers(code, identifier, fallback);

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

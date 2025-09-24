import { Identifier, Literal, Node, parse, PrivateIdentifier, TemplateLiteral } from 'acorn';
import { simple } from 'acorn-walk';
import { findFunctionNameAtPosition } from './find-name.js';

/**
 * Replace identifiers in the code with function names
 */
export function replaceIdentifiers(
  code: string,
  identifier: string,
  fallback: string,
  stringReplace: boolean = true
): string {
  let ast: Node;

  try {
    ast = parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    });
  } catch (error) {
    console.warn('Failed to parse code:', error);
    return code;
  }

  const replacements: Array<{ start: number; end: number; replacement: string }> = [];

  // Find all identifier nodes that match our target
  simple(ast, {
    Identifier(node: PrivateIdentifier | Identifier) {
      if (node.name === identifier) {
        const functionName = findFunctionNameAtPosition(ast, node.start, fallback);
        replacements.push({
          start: node.start,
          end: node.end,
          replacement: `"${functionName}"`,
        });
      }
    },

    // Handle string literals if stringReplace is enabled
    Literal(node: Literal) {
      if (stringReplace && typeof node.value === 'string' && node.value.includes(identifier)) {
        const functionName = findFunctionNameAtPosition(ast, node.start, fallback);
        const newValue = node.value.replaceAll(identifier, functionName);
        replacements.push({
          start: node.start,
          end: node.end,
          replacement: JSON.stringify(newValue),
        });
      }
    },

    // Handle template literals if stringReplace is enabled
    TemplateLiteral(node: TemplateLiteral) {
      if (stringReplace && node.quasis) {
        const functionName = findFunctionNameAtPosition(ast, node.start, fallback);

        // Handle each quasi (string part) separately
        for (const quasi of node.quasis) {
          if (quasi.value && quasi.value.raw && quasi.value.raw.includes(identifier)) {
            const newRawValue = quasi.value.raw.replaceAll(identifier, functionName);

            // Replace the raw content of this quasi
            replacements.push({
              start: quasi.start,
              end: quasi.end,
              replacement: newRawValue,
            });
          }
        }
      }
    },
  });

  // Apply replacements from end to start to maintain positions
  replacements.sort((a, b) => b.start - a.start);

  let result = code;
  for (const replacement of replacements) {
    result =
      result.slice(0, replacement.start) + replacement.replacement + result.slice(replacement.end);
  }

  return result;
}

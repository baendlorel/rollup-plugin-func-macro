import { Node, parse } from 'acorn';
import { simple } from 'acorn-walk';
import { findFunctionNameAtPosition } from './find-name.js';

/**
 * Replace identifiers in the code with function names
 */
export function replaceIdentifiers(code: string, identifier: string, fallback: string): string {
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
    Identifier(node: any) {
      if (node.name === identifier) {
        const functionName = findFunctionNameAtPosition(ast, node.start, fallback);
        replacements.push({
          start: node.start,
          end: node.end,
          replacement: `"${functionName}"`,
        });
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

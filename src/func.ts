import { parse } from 'acorn';
import { simple as walk } from 'acorn-walk';
import { createFilter } from '@rollup/pluginutils';
import type { Plugin } from 'rollup';
import type { Node } from 'acorn';

interface IdentifierNode extends Node {
  name: string;
}

interface FunctionNode extends Node {
  id?: IdentifierNode | null;
}

interface MethodDefinitionNode extends Node {
  key: IdentifierNode | Node;
  value: FunctionNode;
}

/**
 * Find function name at a specific position in the code
 */
function findFunctionNameAtPosition(ast: Node, position: number, fallback: string): string {
  const functionContexts: FunctionContext[] = [];

  // Collect all function contexts
  walk(ast, {
    FunctionDeclaration(node: any) {
      if (node.id?.name) {
        functionContexts.push({
          name: node.id.name,
          type: 'FunctionDeclaration',
          start: node.start,
          end: node.end,
        });
      }
    },

    FunctionExpression(node: any) {
      if (node.id?.name) {
        functionContexts.push({
          name: node.id.name,
          type: 'FunctionExpression',
          start: node.start,
          end: node.end,
        });
      }
    },

    MethodDefinition(node: any) {
      if (node.key?.type === 'Identifier' && node.key.name) {
        functionContexts.push({
          name: node.key.name,
          type: 'MethodDefinition',
          start: node.start,
          end: node.end,
        });
      }
    },
  });

  // Find the innermost function that contains the position
  // Skip arrow functions by only considering our collected contexts
  const containingFunctions = functionContexts
    .filter((func) => position >= func.start && position <= func.end)
    .sort((a, b) => b.start - a.start); // Sort by start position descending (innermost first)

  return containingFunctions.length > 0 ? containingFunctions[0].name : fallback;
}

/**
 * Replace identifiers in the code with function names
 */
function replaceIdentifiers(code: string, identifier: string, fallback: string): string {
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
  walk(ast, {
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

/**
 * Rollup plugin for function macro replacement
 */
export default function funcMacro(options: FuncMacroOptions = {}): Plugin {
  const {
    identifier = '__func__',
    include = ['**/*.js', '**/*.ts'],
    exclude = ['node_modules/**'],
    fallback = 'unknown',
  } = options;

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

import { parse, Identifier, Literal, Node, PrivateIdentifier, TemplateLiteral } from 'acorn';
import { simple } from 'acorn-walk';

interface Replacement {
  start: number;
  end: number;
  replacement: string;
  type: string;
}

/**
 * Replace identifiers in the code with function names
 */
export function replaceIdentifiers(
  code: string,
  opts: { identifier: string; nameFinder: NameFinder; fallback: string; stringReplace: boolean }
): string {
  const ast = silentParse(code);
  if (!ast) {
    return code;
  }

  const replacements = walk(code, ast, identifier, nameFinder, fallback, stringReplace);

  // Apply replacements from end to start to maintain positions
  replacements.sort((a, b) => b.start - a.start);

  let result = code;
  for (let i = 0; i < replacements.length; i++) {
    const r = replacements[i];
    result = result.slice(0, r.start) + r.replacement + result.slice(r.end);
  }

  return result;
}

function silentParse(code: string): Node | null {
  try {
    return parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    });
  } catch (error) {
    console.warn('__NAME__:', error);
    return null;
  }
}

function walk(
  code: string,
  ast: Node,
  identifier: string,
  nameFinder: NameFinder,
  fallback: string,
  stringReplace: boolean
) {
  const replacements: Replacement[] = [];

  /**
   * Push a new replacement if it doesn't already exist
   */
  const add = (o: { start: number; end: number; replacement: string; type: string }) => {
    const { start, end, replacement, type } = o;
    if (
      replacements.some((r) => r.start === start && r.end === end && r.replacement === replacement)
    ) {
      return;
    }
    replacements.push({ start, end, replacement, type });
  };

  const isInTemplateLiteralExpression = (node: PrivateIdentifier | Identifier) => {
    return code[node.start - 2] === '$' && code[node.start - 1] === '{' && code[node.end] === '}';
  };

  // Find all identifier nodes that match our target
  simple(ast, {
    Identifier(node: PrivateIdentifier | Identifier) {
      if (node.name === identifier) {
        const functionName = nameFinder(code, ast, node.start, fallback);

        // & Identifier might be in a template literal expression
        if (isInTemplateLiteralExpression(node)) {
          add({
            start: node.start - 2, // Account for ${
            end: node.end + 1, // Account for }
            replacement: functionName,
            type: node.type,
          });
        } else {
          add({
            start: node.start,
            end: node.end,
            replacement: JSON.stringify(functionName),
            type: node.type,
          });
        }
      }
    },

    // Handle string literals if stringReplace is enabled
    Literal(node: Literal) {
      if (stringReplace && typeof node.value === 'string' && node.value.includes(identifier)) {
        const functionName = nameFinder(code, ast, node.start, fallback);
        const newValue = node.value.replaceAll(identifier, functionName);
        add({
          start: node.start,
          end: node.end,
          replacement: JSON.stringify(newValue),
          type: node.type,
        });
      }
    },

    // Handle template literals if stringReplace is enabled
    TemplateLiteral(node: TemplateLiteral) {
      if (stringReplace && node.quasis && node.expressions) {
        const functionName = nameFinder(code, ast, node.start, fallback);

        // Handle expressions that are just the identifier
        for (const expr of node.expressions) {
          if (expr.type !== 'Identifier' || expr.name !== identifier) {
            continue;
          }

          add({
            start: expr.start - 2, // Account for ${
            end: expr.end + 1, // Account for }
            replacement: functionName,
            type: node.type,
          });
        }

        // Handle each quasi (string part) separately

        for (let i = 0; i < node.quasis.length; i++) {
          const quasi = node.quasis[i];
          if (!quasi.value.raw.includes(identifier)) {
            continue;
          }

          const newRawValue = quasi.value.raw.replaceAll(identifier, functionName);
          // Replace the raw content of this quasi
          add({
            start: quasi.start,
            end: quasi.end,
            replacement: newRawValue,
            type: node.type,
          });
        }
      }
    },
  });

  return replacements;
}

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
        let hasReplacement = false;

        for (const quasi of node.quasis) {
          if (quasi.value && quasi.value.raw && quasi.value.raw.includes(identifier)) {
            hasReplacement = true;
            break;
          }
        }

        if (hasReplacement) {
          // For template literals, we need to reconstruct the entire template
          let templateString = '`';
          let expressionIndex = 0;

          for (let i = 0; i < node.quasis.length; i++) {
            const quasi = node.quasis[i];
            let rawValue = quasi.value.raw;
            rawValue = rawValue.replaceAll(identifier, functionName);
            templateString += rawValue;

            if (!quasi.tail && node.expressions[expressionIndex]) {
              templateString +=
                '${' +
                code.slice(
                  node.expressions[expressionIndex].start,
                  node.expressions[expressionIndex].end
                ) +
                '}';
              expressionIndex++;
            }
          }
          templateString += '`';

          replacements.push({
            start: node.start,
            end: node.end,
            replacement: templateString,
          });
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

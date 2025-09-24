import { Node } from 'acorn';
import { simple } from 'acorn-walk';
/**
 * Find function name at a specific position in the code
 */
export function findFunctionNameAtPosition(ast: Node, position: number, fallback: string): string {
  const functionContexts: FunctionContext[] = [];

  // Collect all function contexts
  simple(ast, {
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

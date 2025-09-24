import { TSESTree } from '@typescript-eslint/typescript-estree';

/**
 * Find function name at a specific position in the code
 */
export function findFunctionNameAtPosition(
  ast: TSESTree.Program,
  position: number,
  fallback: string
): string {
  const functionContexts: FunctionContext[] = [];

  // Traverse AST to collect all function contexts
  function traverse(node: TSESTree.Node): void {
    if (!node || typeof node !== 'object') return;

    // Check if position is within node range
    const nodeStart = node.range?.[0] ?? 0;
    const nodeEnd = node.range?.[1] ?? 0;

    switch (node.type) {
      case 'FunctionDeclaration':
        if (node.id?.name) {
          functionContexts.push({
            name: node.id.name,
            type: 'FunctionDeclaration',
            start: nodeStart,
            end: nodeEnd,
          });
        }
        break;

      case 'FunctionExpression':
        if (node.id?.name) {
          functionContexts.push({
            name: node.id.name,
            type: 'FunctionExpression',
            start: nodeStart,
            end: nodeEnd,
          });
        }
        break;

      case 'MethodDefinition':
        if (node.key?.type === 'Identifier') {
          functionContexts.push({
            name: node.key.name,
            type: 'MethodDefinition',
            start: nodeStart,
            end: nodeEnd,
          });
        }
        break;

      case 'TSMethodSignature':
        if (node.key?.type === 'Identifier') {
          functionContexts.push({
            name: node.key.name,
            type: 'MethodDefinition',
            start: nodeStart,
            end: nodeEnd,
          });
        }
        break;
    }

    // Recursively traverse child nodes
    for (const key in node) {
      const child = (node as any)[key];
      if (Array.isArray(child)) {
        child.forEach(traverse);
      } else if (child && typeof child === 'object' && child.type) {
        traverse(child);
      }
    }
  }

  traverse(ast);

  // Find the innermost function that contains the position
  // Skip arrow functions by only considering our collected contexts
  const containingFunctions = functionContexts
    .filter((func) => position >= func.start && position <= func.end)
    .sort((a, b) => b.start - a.start); // Sort by start position descending (innermost first)

  return containingFunctions.length > 0 ? containingFunctions[0].name : fallback;
}

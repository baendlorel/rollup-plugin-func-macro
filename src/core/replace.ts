import { TSESTree, parse } from '@typescript-eslint/typescript-estree';
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
  let ast: TSESTree.Program;

  try {
    ast = parse(code, {
      loc: true,
      range: true,
      ecmaVersion: 'latest',
      sourceType: 'module',
      jsx: true,
      errorOnUnknownASTType: false,
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      allowInvalidAST: true,
      comment: false,
      tokens: false,
    });
  } catch (error) {
    console.warn('Failed to parse code:', error);
    return code;
  }

  const replacements: Array<{ start: number; end: number; replacement: string }> = [];

  // Traverse AST to find replacements
  function traverse(node: TSESTree.Node): void {
    if (!node || typeof node !== 'object') return;

    const nodeStart = node.range?.[0] ?? 0;
    const nodeEnd = node.range?.[1] ?? 0;

    switch (node.type) {
      case 'Identifier':
        if (node.name === identifier) {
          const functionName = findFunctionNameAtPosition(ast, nodeStart, fallback);
          replacements.push({
            start: nodeStart,
            end: nodeEnd,
            replacement: `"${functionName}"`,
          });
        }
        break;

      case 'Literal':
        if (stringReplace && typeof node.value === 'string' && node.value.includes(identifier)) {
          const functionName = findFunctionNameAtPosition(ast, nodeStart, fallback);
          const newValue = node.value.replaceAll(identifier, functionName);
          replacements.push({
            start: nodeStart,
            end: nodeEnd,
            replacement: JSON.stringify(newValue),
          });
        }
        break;

      case 'TemplateLiteral':
        if (stringReplace && node.quasis) {
          const functionName = findFunctionNameAtPosition(ast, nodeStart, fallback);
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
                const exprStart = node.expressions[expressionIndex].range?.[0] ?? 0;
                const exprEnd = node.expressions[expressionIndex].range?.[1] ?? 0;
                templateString += '${' + code.slice(exprStart, exprEnd) + '}';
                expressionIndex++;
              }
            }
            templateString += '`';

            replacements.push({
              start: nodeStart,
              end: nodeEnd,
              replacement: templateString,
            });
          }
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

  // Apply replacements from end to start to maintain positions
  replacements.sort((a, b) => b.start - a.start);

  let result = code;
  for (const replacement of replacements) {
    result =
      result.slice(0, replacement.start) + replacement.replacement + result.slice(replacement.end);
  }

  return result;
}

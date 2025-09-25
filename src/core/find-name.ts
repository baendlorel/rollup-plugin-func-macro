import {
  Node,
  AnonymousFunctionDeclaration,
  FunctionDeclaration,
  MethodDefinition,
  FunctionExpression,
} from 'acorn';
import { simple } from 'acorn-walk';

/**
 * Find function name at a specific position in the code
 */
export function findFunctionNameAtPosition(ast: Node, position: number, fallback: string): string {
  const funcs: FunctionContext[] = [];
  const add = (node: FunctionNode, name: string) =>
    funcs.push({
      name,
      start: node.start,
      end: node.end,
    });

  // console.dir(ast, { depth: 12 });

  // Collect all function contexts
  simple(ast, {
    FunctionDeclaration(node: FunctionDeclaration | AnonymousFunctionDeclaration) {
      add(node, node.id?.name ?? '[anonymous function]');
    },

    FunctionExpression(node: FunctionExpression) {
      add(node, node.id?.name ?? '[anonymous function expression]');
    },

    MethodDefinition(node: MethodDefinition) {
      const key = node.key;
      let name: string = '[anonymous method]';

      if (key.type === 'Identifier') {
        // Regular method: methodName() {}
        name = key.name;
      } else if (key.type === 'Literal') {
        // Dynamic method: ['methodName']() {} or ["methodName"]() {}
        name = String(key.value);
      }
      add(node, name);
    },
  });

  const deduped = dedup(funcs);
  // Find the innermost function that contains the position
  // Skip arrow functions by only considering our collected contexts
  // & Find the closest function name
  let name = fallback;
  let maxStart = -1;
  for (let i = 0; i < deduped.length; i++) {
    const func = deduped[i];
    if (position < func.start || func.end < position) {
      continue;
    }

    // Better to be greater than maxStart
    if (func.start > maxStart) {
      name = func.name;
      maxStart = func.start;
    }
  }

  return name;
}

/**
 * # Weird Case
 * From the script below, acorn will detect **2** methods with the same `node.end`.
 * One is anonymous, one is named.
 *
 * So we only keep the named one.
 *
 * ```ts
 * class TestClass {
 *   ['dynamicMethod']() {
 *     console.log("dynamicMethod");
 *   }
 * };
 * ```
 */
function dedup(funcs: FunctionContext[]): FunctionContext[] {
  const filtered: FunctionContext[] = [];
  for (let i = 0; i < funcs.length; i++) {
    const func = funcs[i];

    const index = filtered.findIndex((f) => f.end === func.end);
    if (filtered[index]) {
      if (filtered[index].start >= func.start) {
        filtered[index] = func;
      }
    } else {
      filtered.push(func);
    }
  }
  return filtered;
}

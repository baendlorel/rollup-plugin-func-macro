import {
  AnonymousFunctionDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  MethodDefinition,
  Node as AcornNode,
} from 'acorn';

declare global {
  type FunctionNode =
    | FunctionDeclaration
    | AnonymousFunctionDeclaration
    | FunctionExpression
    | MethodDefinition;

  const __IS_DEV__: boolean;

  interface FunctionContext {
    name: string;
    start: number;
    end: number;
  }

  type NameGetter = (code: string, ast: AcornNode, position: number, fallback: string) => string;
}

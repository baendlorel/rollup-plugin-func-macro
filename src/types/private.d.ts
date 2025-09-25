import {
  AnonymousFunctionDeclaration,
  FunctionDeclaration,
  FunctionExpression,
  MethodDefinition,
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
}

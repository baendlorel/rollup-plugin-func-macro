declare const __IS_DEV__: boolean;

interface FunctionContext {
  name: string;
  type: 'FunctionDeclaration' | 'FunctionExpression' | 'MethodDefinition';
  start: number;
  end: number;
}

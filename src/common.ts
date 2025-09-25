export const enum Consts {
  InvalidUsingMacroInMethodName = '[Invalid]',
  AnonymousFunction = '[anonymous function]',
  AnonymousFunctionExpression = '[anonymous function expression]',
  AnonymousMethod = '[anonymous method]',
}

export const enum Macro {
  Func = '__func__',
  File = '__file__',
}

export function between(center: number, oneSide: number, otherSide: number) {
  return (oneSide <= center && center <= otherSide) || (otherSide <= center && center <= oneSide);
}

export function betweenStrict(center: number, oneSide: number, otherSide: number) {
  return (oneSide < center && center < otherSide) || (otherSide < center && center < oneSide);
}

export function normalize(options: Partial<FuncMacroOptions> | undefined): FuncMacroOptions {
  const {
    identifier = Macro.Func,
    fileIdentifier = Macro.File,
    include = ['**/*.js', '**/*.ts'],
    exclude = ['node_modules/**'],
    fallback = identifier,
    stringReplace = true,
  } = Object(options);

  if (typeof identifier !== 'string' || !identifier) {
    throw new TypeError('__NAME__: identifier must be a non-empty string');
  }

  if (typeof fileIdentifier !== 'string' || !fileIdentifier) {
    throw new TypeError('__NAME__: fileIdentifier must be a non-empty string or undefined');
  }

  if (!Array.isArray(include) || include.some((v) => typeof v !== 'string')) {
    throw new TypeError('__NAME__: include must be string[]');
  }

  if (!Array.isArray(exclude) || exclude.some((v) => typeof v !== 'string')) {
    throw new TypeError('__NAME__: exclude must be string[]');
  }

  if (typeof fallback !== 'string') {
    throw new TypeError('__NAME__: fallback must be a string');
  }

  if (typeof stringReplace !== 'boolean') {
    throw new TypeError('__NAME__: stringReplace must be a boolean');
  }

  return {
    identifier,
    fileIdentifier,
    include,
    exclude,
    fallback,
    stringReplace,
  };
}

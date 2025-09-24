export function normalize(options: Partial<FuncMacroOptions> | undefined): FuncMacroOptions {
  const {
    identifier = '__func__',
    include = ['**/*.js', '**/*.ts'],
    exclude = ['node_modules/**'],
    fallback = 'unknown',
  } = Object(options);

  if (typeof identifier !== 'string' || !identifier) {
    throw new TypeError('__KEBAB_NAME__: identifier must be a non-empty string');
  }

  if (!Array.isArray(include) || include.some((v) => typeof v !== 'string')) {
    throw new TypeError('__KEBAB_NAME__: include must be string[]');
  }

  if (!Array.isArray(exclude) || exclude.some((v) => typeof v !== 'string')) {
    throw new TypeError('__KEBAB_NAME__: exclude must be string[]');
  }

  if (typeof fallback !== 'string') {
    throw new TypeError('__KEBAB_NAME__: fallback must be a string');
  }

  return {
    identifier,
    include,
    exclude,
    fallback,
  };
}

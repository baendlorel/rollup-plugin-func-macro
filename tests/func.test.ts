import { expect, describe, it } from 'vitest';
import { funcMacro } from '../src/func.js';

describe('funcMacro', () => {
  const callTransform = (plugin: any, code: string, id: string) => {
    const transformHook = plugin.transform;
    if (typeof transformHook === 'function') {
      return transformHook.call({}, code, id);
    } else if (transformHook && typeof transformHook.handler === 'function') {
      return transformHook.handler.call({}, code, id);
    }
    return null;
  };

  it('should replace __func__ in function declaration', () => {
    const plugin = funcMacro();
    const code = `function testFunction() {
                    console.log(__func__);
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"testFunction"');
    expect(result.code).not.toContain('__func__');
  });

  it('should replace __func__ in function expression', () => {
    const plugin = funcMacro();
    const code = `const myFunc = function namedFunc() {
                    return __func__;
                  };`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"namedFunc"');
    expect(result.code).not.toContain('__func__');
  });

  it('should replace __func__ in class method', () => {
    const plugin = funcMacro();
    const code = `class TestClass {
                    myMethod() {
                      console.log(__func__);
                    }
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"myMethod"');
    expect(result.code).not.toContain('__func__');
  });

  it('should use fallback when no function name found', () => {
    const plugin = funcMacro({ fallback: 'fallback_name' });
    const code = `console.log(__func__);`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"fallback_name"');
  });

  it('should handle custom identifier', () => {
    const plugin = funcMacro({ identifier: '__function_name__' });
    const code = `function testFunc() {
                    console.log(__function_name__);
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"testFunc"');
    expect(result.code).not.toContain('__function_name__');
  });

  it('should skip arrow functions', () => {
    const plugin = funcMacro();
    const code = `function outerFunc() {
                    const arrow = () => {
                      console.log(__func__);
                    };
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    // Should find outerFunc, not the arrow function
    expect(result.code).toContain('"outerFunc"');
  });

  it('should handle nested functions correctly', () => {
    const plugin = funcMacro();
    const code = `function outerFunc() {
                    console.log(__func__); // Should be "outerFunc"
                    
                    function innerFunc() {
                      console.log(__func__); // Should be "innerFunc"
                    }
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"outerFunc"');
    expect(result.code).toContain('"innerFunc"');
  });

  it('should not transform files that do not match filter', () => {
    const plugin = funcMacro({ exclude: ['**/test.js'] });
    const code = `function testFunc() {
                    console.log(__func__);
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeNull();
  });

  it('should not transform when identifier is not present', () => {
    const plugin = funcMacro();
    const code = `function testFunc() {
                    console.log("hello");
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeNull();
  });

  it('should handle multiple identifiers in the same function', () => {
    const plugin = funcMacro();
    const code = `function testFunc() {
                    console.log("Function name:", __func__);
                    console.log("Called from:", __func__);
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    const transformedCode = result.code;
    expect(transformedCode).toContain('"testFunc"');
    expect(transformedCode).not.toContain('__func__');
    // Should replace both occurrences
    expect((transformedCode.match(/"testFunc"/g) || []).length).toBe(2);
  });

  it('should handle method definitions with computed properties', () => {
    const plugin = funcMacro({});
    const code = `class TestClass {
                    ['dynamicMethod']() {
                      console.log(__func__);
                    }
                  }`;

    const result = callTransform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    // For computed properties, should fallback to default
    expect(result.code).toContain('"__func__"');
  });

  describe('String replacement functionality', () => {
    it('should replace __func__ in string literals when stringReplace is true', () => {
      const plugin = funcMacro({ stringReplace: true });
      const code = `function testFunction() {
                      console.log("Current function: __func__");
                    }`;

      const result = callTransform(plugin, code, 'test.js');
      expect(result).toBeTruthy();
      expect(result.code).toContain('"Current function: testFunction"');
      expect(result.code).not.toContain('__func__');
    });

    it('should NOT replace __func__ in string literals when stringReplace is false', () => {
      const plugin = funcMacro({ stringReplace: false });
      const code = `function testFunction() {
                      console.log("Current function: __func__");
                    }`;

      const result = callTransform(plugin, code, 'test.js');
      expect(result).toBeNull(); // No transformation should occur
    });

    it('should replace __func__ in template literals when stringReplace is true', () => {
      const plugin = funcMacro({ stringReplace: true });
      const code = `function testFunction() {
                      console.log(\`Current function: __func__\`);
                    }`;

      const result = callTransform(plugin, code, 'test.js');
      expect(result).toBeTruthy();
      expect(result.code).toContain('`Current function: testFunction`');
      expect(result.code).not.toContain('__func__');
    });

    it('should replace multiple __func__ occurrences in same string', () => {
      const plugin = funcMacro({ stringReplace: true });
      const code = `function testFunction() {
                      console.log("__func__ called __func__");
                    }`;

      const result = callTransform(plugin, code, 'test.js');
      expect(result).toBeTruthy();
      expect(result.code).toContain('"testFunction called testFunction"');
    });

    it('should handle template literals with expressions', () => {
      const plugin = funcMacro({ stringReplace: true });
      const code = `function testFunction() {
                      const x = 42;
                      console.log(\`Function __func__ with value \${x}\`);
                    }`;

      const result = callTransform(plugin, code, 'test.js');
      expect(result).toBeTruthy();
      expect(result.code).toContain('`Function testFunction with value ${x}`');
    });

    it('should replace both identifier and string occurrences', () => {
      const plugin = funcMacro({ stringReplace: true });
      const code = `function testFunction() {
                      const name = __func__;
                      console.log("Function name is __func__");
                    }`;

      const result = callTransform(plugin, code, 'test.js');
      expect(result).toBeTruthy();
      expect(result.code).toContain('"testFunction"');
      expect(result.code).toContain('"Function name is testFunction"');
      expect(result.code).not.toContain('__func__');
    });

    it('should use custom identifier in strings', () => {
      const plugin = funcMacro({
        identifier: '__FUNCTION_NAME__',
        stringReplace: true,
      });
      const code = `function testFunction() {
                      console.log("Current: __FUNCTION_NAME__");
                    }`;

      const result = callTransform(plugin, code, 'test.js');
      expect(result).toBeTruthy();
      expect(result.code).toContain('"Current: testFunction"');
    });
  });
});

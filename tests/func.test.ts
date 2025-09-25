import { expect, describe, it } from 'vitest';
import { funcMacro } from '../src/func.js';
import { transform, pr } from './utils.js';

describe('funcMacro', () => {
  it('should replace __func__ in function declaration', () => {
    const plugin = funcMacro();
    const code = pr`function testFunction() {
                    console.log(__func__);
                  }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"testFunction"');
    expect(result.code).not.toContain('__func__');
  });

  it('should replace __func__ in function expression', () => {
    const plugin = funcMacro();
    const code = pr`const myFunc = function namedFunc() {
                    return __func__;
                  };`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"namedFunc"');
    expect(result.code).not.toContain('__func__');
  });

  it('should replace __func__ in class method', () => {
    const plugin = funcMacro();
    const code = pr`class TestClass {
                       myMethod() {
                         console.log(__func__);
                       }
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"myMethod"');
    expect(result.code).not.toContain('__func__');
  });

  it('should use fallback when no function name found', () => {
    const plugin = funcMacro({ fallback: 'fallback_name' });
    const code = `console.log(__func__);`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"fallback_name"');
  });

  it('should handle custom identifier', () => {
    const plugin = funcMacro({ identifier: '__function_name__' });
    const code = pr`function testFunc() {
                      console.log(__function_name__);
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"testFunc"');
    expect(result.code).not.toContain('__function_name__');
  });

  it('should skip arrow functions', () => {
    const plugin = funcMacro();
    const code = pr`function outerFunc() {
                      const arrow = () => {
                        console.log(__func__);
                      };
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    // Should find outerFunc, not the arrow function
    expect(result.code).toContain('"outerFunc"');
  });

  it('should handle nested functions correctly', () => {
    const plugin = funcMacro();
    const code = pr`function outerFunc() {
                      console.log(__func__); // Should be "outerFunc"
                      
                      function innerFunc() {
                        console.log(__func__); // Should be "innerFunc"
                      }
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    expect(result.code).toContain('"outerFunc"');
    expect(result.code).toContain('"innerFunc"');
  });

  it('should not transform files that do not match filter', () => {
    const plugin = funcMacro({ exclude: ['**/test.js'] });
    const code = pr`function testFunc() {
                      console.log(__func__);
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeNull();
  });

  it('should not transform when identifier is not present', () => {
    const plugin = funcMacro();
    const code = pr`function testFunc() {
                      console.log("hello");
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeNull();
  });

  it('should handle multiple identifiers in the same function', () => {
    const plugin = funcMacro();
    const code = pr`function testFunc() {
                      console.log("Function name:", __func__);
                      console.log("Called from:", __func__);
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    const transformedCode = result.code;
    expect(transformedCode).toContain('"testFunc"');
    expect(transformedCode).not.toContain('__func__');
    // Should replace both occurrences
    expect((transformedCode.match(/"testFunc"/g) || []).length).toBe(2);
  });

  it('should handle method definitions with computed properties', () => {
    const plugin = funcMacro({});
    const code = pr`class TestClass {
                      ['dynamicMethod']() {
                        console.log(__func__);
                      }
                    }`;

    const result = transform(plugin, code, 'test.js');
    expect(result).toBeTruthy();
    // For computed properties, should fallback to default
    expect(result.code).toContain('"__func__"');
  });
});

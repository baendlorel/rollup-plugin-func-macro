import { expect, describe, it } from 'vitest';
import { funcMacro } from '../src/func.js';
import { apply, pr } from './utils.js';

describe('funcMacro', () => {
  it('should handle dynamic name', () => {
    const plugin = funcMacro({});
    const code = pr`class TestClass {
                      ['dynamicMethod']() {
                        console.log(__func__);
                      }
                    };`;

    // ?? 这里还需要探讨，动态属性的没有解析
    const result = apply(plugin, code, 'test.js');
    expect(result).toBe(pr`class TestClass {
                            ['dynamicMethod']() {
                              console.log("dynamicMethod");
                            }
                           };`);
  });

  it('should handle complex situations', () => {
    const plugin = funcMacro({});
    const code = pr`class TestClass {
                      ['dynamicMethod']() {
                        console.log(__func__);
                      }
                    };
                    function testFunction() {
                      const name = __func__ + '2323';
                      function innter() {
                        console.log("Current: __func__",__func__);
                      }
                    }`;

    const result = apply(plugin, code, 'test.js');
    expect(result).toBe(pr`class TestClass {
                            ['dynamicMethod']() {
                              console.log("dynamicMethod");
                            }
                          };
                          function testFunction() {
                            const name = "testFunction" + '2323';
                            function innter() {
                              console.log("Current: innter","innter");
                            }
                          }`);
  });
});

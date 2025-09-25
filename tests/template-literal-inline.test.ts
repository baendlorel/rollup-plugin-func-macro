import { describe, it, expect } from 'vitest';
import { replaceIdentifiers } from '../src/core/replace.js';

describe('Template Literal Inline Expression Replacement', () => {
  it('should replace ${__func__} directly with function name', () => {
    const code = `
function myFunction() {
  console.log(\`Hello \${__func__} world\`);
}`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toBe(`
function myFunction() {
  console.log(\`Hello myFunction world\`);
}`);
    expect(result).not.toContain('${__func__}');
    expect(result).not.toContain('${"myFunction"}');
  });

  it('should handle complex template literals with mixed expressions', () => {
    const code = `
function testFunction() {
  const name = "test";
  console.log(\`[PREFIX: \${name}] \${__func__} is running\`);
}`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toBe(`
function testFunction() {
  const name = "test";
  console.log(\`[PREFIX: \${name}] testFunction is running\`);
}`);
    expect(result).toContain('${name}'); // Should keep other expressions
    expect(result).not.toContain('${__func__}');
  });

  it('should handle the problematic case from bug report', () => {
    const code = `
function openPopupWindow() {
  try {
    // some code
  } catch (error) {
    console.error(\`[__NAME__: \${__func__}]__func__ Failed to open popup window:\`, error);
  }
}
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain(
      '`[__NAME__: openPopupWindow]openPopupWindow Failed to open popup window:`'
    );
    expect(result).not.toContain('${__func__}');
  });

  it('should only replace exact identifier matches in expressions', () => {
    const code = `
function myFunc() {
  console.log(\`\${__func__} and \${__func__name}\`);
}
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain('`myFunc and ${__func__name}`');
    expect(result).toContain('${__func__name}'); // Should not replace partial matches
    expect(result).not.toContain('${__func__}');
  });

  it('should handle multiple ${__func__} in same template literal', () => {
    const code = `
function multiTest() {
  console.log(\`Start \${__func__} middle \${__func__} end\`);
}
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain('`Start multiTest middle multiTest end`');
    expect(result).not.toContain('${__func__}');
  });

  it('should work with custom identifier', () => {
    const code = `
function customFunc() {
  console.log(\`Function: \${__function_name__}\`);
}
`;

    const result = replaceIdentifiers(code, '__function_name__', 'unknown', true);

    expect(result).toContain('`Function: customFunc`');
    expect(result).not.toContain('${__function_name__}');
  });

  it('should handle nested functions correctly', () => {
    const code = `
function outerFunction() {
  function innerFunction() {
    console.log(\`Inner: \${__func__}\`);
  }
  console.log(\`Outer: \${__func__}\`);
}
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain('`Inner: innerFunction`');
    expect(result).toContain('`Outer: outerFunction`');
  });

  it('should work with class methods', () => {
    const code = `
class MyClass {
  myMethod() {
    console.log(\`Method: \${__func__}\`);
  }
}
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain('`Method: myMethod`');
    expect(result).not.toContain('${__func__}');
  });

  it('should use fallback when function name not found', () => {
    const code = `
const arrowFunc = () => {
  console.log(\`Arrow: \${__func__}\`);
};
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain('`Arrow: unknown`');
    expect(result).not.toContain('${__func__}');
  });

  it('should handle template literals without expressions', () => {
    const code = `
function testFunc() {
  console.log(\`Just __func__ in string\`);
}
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain('`Just testFunc in string`');
  });

  it('should handle complex expressions in template literals', () => {
    const code = `
function complexFunc() {
  const obj = { name: 'test' };
  console.log(\`Complex: \${obj.name} \${__func__} \${Date.now()}\`);
}
`;

    const result = replaceIdentifiers(code, '__func__', 'unknown', true);

    expect(result).toContain('`Complex: ${obj.name} complexFunc ${Date.now()}`');
    expect(result).toContain('${obj.name}');
    expect(result).toContain('${Date.now()}');
    expect(result).not.toContain('${__func__}');
  });
});

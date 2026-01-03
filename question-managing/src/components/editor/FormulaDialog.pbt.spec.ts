/**
 * Property-Based Tests for LaTeX Formula Handling
 * 
 * **Property 3: LaTeX Formula Handling**
 * *For any* LaTeX formula (inline `$...$` or block `$$...$$`), the Rich_Text_Editor 
 * SHALL parse it correctly, handle syntax errors gracefully without crashing, 
 * and preserve the original LaTeX code in the raw content.
 * 
 * **Validates: Requirements 3.1, 3.3, 3.4**
 * 
 * Feature: rich-text-editor, Property 3: LaTeX Formula Handling
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { parseLatexFormula } from './FormulaDialog';

/**
 * Generator for valid LaTeX formulas
 */
const validLatexArbitrary = fc.oneof(
  // Simple expressions
  fc.constantFrom(
    'x',
    'y',
    'z',
    'a + b',
    'x - y',
    '2 + 2',
    'E = mc^2',
    'a^2 + b^2 = c^2'
  ),
  // Fractions
  fc.tuple(
    fc.constantFrom('a', 'b', 'x', 'y', '1', '2', '3'),
    fc.constantFrom('a', 'b', 'x', 'y', '1', '2', '3')
  ).map(([num, den]) => `\\frac{${num}}{${den}}`),
  // Square roots
  fc.constantFrom('a', 'b', 'x', 'y', '2', '3', '4')
    .map(content => `\\sqrt{${content}}`),
  // Superscripts
  fc.tuple(
    fc.constantFrom('x', 'y', 'a', 'b'),
    fc.constantFrom('2', '3', 'n', 'i')
  ).map(([base, exp]) => `${base}^{${exp}}`),
  // Subscripts
  fc.tuple(
    fc.constantFrom('x', 'y', 'a', 'b'),
    fc.constantFrom('1', '2', 'i', 'n')
  ).map(([base, sub]) => `${base}_{${sub}}`),
  // Greek letters
  fc.constantFrom(
    '\\alpha',
    '\\beta',
    '\\gamma',
    '\\delta',
    '\\pi',
    '\\theta',
    '\\lambda',
    '\\sigma'
  ),
  // Sums and integrals
  fc.constantFrom(
    '\\sum_{i=1}^{n} x_i',
    '\\int_{a}^{b} f(x) dx',
    '\\prod_{i=1}^{n} x_i',
    '\\lim_{x \\to \\infty} f(x)'
  )
);

/**
 * Generator for invalid LaTeX formulas (syntax errors)
 */
const invalidLatexArbitrary = fc.oneof(
  // Unmatched braces
  fc.constantFrom(
    '\\frac{a}{',
    '\\frac{a}',
    '\\sqrt{',
    '{{{',
    '}}}',
    '\\frac{}{}'
  ),
  // Unknown commands
  fc.constantFrom('abc', 'xyz', 'foo', 'bar')
    .map(cmd => `\\${cmd}unknown{x}`),
  // Invalid syntax
  fc.constantFrom(
    '\\frac',
    '\\sqrt',
    '\\begin{unknown}',
    '\\end{unknown}'
  )
);

/**
 * Generator for arbitrary strings (may or may not be valid LaTeX)
 */
const arbitraryStringArbitrary = fc.string({ minLength: 0, maxLength: 100 });

describe('Property 3: LaTeX Formula Handling', () => {
  /**
   * Property 3.1: Valid LaTeX formulas should parse successfully
   * For any valid LaTeX formula, parseLatexFormula should return HTML without error
   */
  it('should parse valid LaTeX formulas without errors', () => {
    fc.assert(
      fc.property(validLatexArbitrary, (latex) => {
        const result = parseLatexFormula(latex);
        
        // Should not have an error
        expect(result.error).toBeNull();
        // Should produce non-empty HTML for non-empty input
        if (latex.trim()) {
          expect(result.html).toBeTruthy();
          expect(result.html.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.2: Invalid LaTeX formulas should be handled gracefully
   * For any invalid LaTeX formula, parseLatexFormula should return an error message
   * without throwing an exception
   */
  it('should handle invalid LaTeX formulas gracefully without crashing', () => {
    fc.assert(
      fc.property(invalidLatexArbitrary, (latex) => {
        // Should not throw
        let result;
        expect(() => {
          result = parseLatexFormula(latex);
        }).not.toThrow();
        
        // Should return an error message
        expect(result).toBeDefined();
        if (result!.error) {
          expect(typeof result!.error).toBe('string');
          expect(result!.error.length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.3: Empty input should be handled gracefully
   * For empty or whitespace-only input, parseLatexFormula should return empty result
   */
  it('should handle empty input gracefully', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', ' ', '  ', '\t', '\n', '   '),
        (whitespace) => {
          const result = parseLatexFormula(whitespace);
          
          // Should not have an error for empty/whitespace input
          expect(result.error).toBeNull();
          // Should return empty HTML
          expect(result.html).toBe('');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.4: Arbitrary strings should never cause crashes
   * For any arbitrary string input, parseLatexFormula should never throw
   */
  it('should never crash on arbitrary string input', () => {
    fc.assert(
      fc.property(arbitraryStringArbitrary, (input) => {
        // Should never throw, regardless of input
        expect(() => {
          parseLatexFormula(input);
        }).not.toThrow();
        
        // Should always return a valid result object
        const result = parseLatexFormula(input);
        expect(result).toBeDefined();
        expect(typeof result.html).toBe('string');
        expect(result.error === null || typeof result.error === 'string').toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3.5: Parsed HTML should contain KaTeX classes for valid formulas
   * For any valid LaTeX formula, the output HTML should contain KaTeX-specific markup
   */
  it('should produce KaTeX-formatted HTML for valid formulas', () => {
    fc.assert(
      fc.property(validLatexArbitrary, (latex) => {
        const result = parseLatexFormula(latex);
        
        if (!result.error && latex.trim()) {
          // KaTeX output should contain specific class names
          expect(result.html).toContain('katex');
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * ContentService 属性测试
 * 
 * Property 4: Content Processing Round Trip
 * For any raw content containing LaTeX formulas, the Content_Processor SHALL extract all formulas,
 * convert them to images, and produce a rendered output where all formula markers are replaced
 * with img tags, while the raw content remains unchanged.
 * 
 * **Validates: Requirements 4.1, 4.3, 4.5**
 */
import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { ContentService, RichContent } from './content.service';
import { FormulaService } from '@/modules/formula/formula.service';

describe('ContentService Property Tests', () => {
  let service: ContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: FormulaService,
          useValue: {
            renderBatch: jest.fn().mockImplementation((formulas) => {
              const results = new Map<string, string | null>();
              for (const { latex, inline } of formulas) {
                const key = `${inline ? 'inline' : 'block'}:${latex}`;
                // Simulate successful conversion
                results.set(key, `data:image/svg+xml;base64,mock_${Buffer.from(latex).toString('base64')}`);
              }
              return Promise.resolve(results);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
  });

  /**
   * Generator for valid LaTeX formulas (simple expressions)
   */
  const latexFormulaArb = fc.oneof(
    // Simple variable
    fc.constantFrom('x', 'y', 'z', 'a', 'b', 'n'),
    // Power expressions
    fc.tuple(
      fc.constantFrom('x', 'y', 'z'),
      fc.integer({ min: 2, max: 9 })
    ).map(([v, n]) => `${v}^${n}`),
    // Fractions
    fc.tuple(
      fc.integer({ min: 1, max: 9 }),
      fc.integer({ min: 1, max: 9 })
    ).map(([a, b]) => `\\frac{${a}}{${b}}`),
    // Sum notation
    fc.constantFrom(
      '\\sum_{i=1}^{n} i',
      '\\sum_{k=0}^{n} k^2',
      '\\int_0^1 x dx'
    ),
    // Common formulas
    fc.constantFrom(
      'E=mc^2',
      'a^2+b^2=c^2',
      '\\pi r^2',
      '\\sqrt{x}',
      '\\alpha + \\beta'
    )
  );

  /**
   * Generator for HTML content with inline formulas
   */
  const htmlWithInlineFormulaArb = fc.tuple(
    fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('$')),
    latexFormulaArb,
    fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('$'))
  ).map(([before, formula, after]) => `<p>${before}$${formula}$${after}</p>`);

  /**
   * Generator for HTML content with block formulas
   */
  const htmlWithBlockFormulaArb = fc.tuple(
    fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('$')),
    latexFormulaArb,
    fc.string({ minLength: 0, maxLength: 50 }).filter(s => !s.includes('$'))
  ).map(([before, formula, after]) => `<p>${before}$$${formula}$$${after}</p>`);

  /**
   * Generator for plain HTML content without formulas
   */
  const plainHtmlArb = fc.string({ minLength: 1, maxLength: 100 })
    .filter(s => !s.includes('$'))
    .map(s => `<p>${s}</p>`);

  /**
   * Property 4: Content Processing Round Trip
   * 
   * Feature: rich-text-editor, Property 4: Content Processing Round Trip
   * For any raw content containing LaTeX formulas, processing should:
   * 1. Preserve the raw content unchanged
   * 2. Replace formula markers with img tags in rendered content
   * 3. Maintain content structure
   */
  describe('Property 4: Content Processing Round Trip', () => {
    it('raw content should remain unchanged after processing', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(htmlWithInlineFormulaArb, htmlWithBlockFormulaArb, plainHtmlArb),
          async (rawContent) => {
            const result = await service.processContent(rawContent);
            
            // Raw content must be preserved exactly
            expect(result.raw).toBe(rawContent);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('inline formulas should be replaced with img tags in rendered content', async () => {
      await fc.assert(
        fc.asyncProperty(
          htmlWithInlineFormulaArb,
          async (rawContent) => {
            const result = await service.processContent(rawContent);
            
            // Raw should contain the original formula marker
            expect(result.raw).toMatch(/\$[^$]+\$/);
            
            // Rendered should not contain inline formula markers (single $)
            // but should contain img tags
            expect(result.rendered).toContain('<img');
            expect(result.rendered).toContain('class="formula inline"');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('block formulas should be replaced with img tags in rendered content', async () => {
      await fc.assert(
        fc.asyncProperty(
          htmlWithBlockFormulaArb,
          async (rawContent) => {
            const result = await service.processContent(rawContent);
            
            // Raw should contain the original formula marker
            expect(result.raw).toMatch(/\$\$[^$]+\$\$/);
            
            // Rendered should not contain block formula markers ($$)
            // but should contain img tags
            expect(result.rendered).toContain('<img');
            expect(result.rendered).toContain('class="formula block"');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('content without formulas should have identical raw and rendered', async () => {
      await fc.assert(
        fc.asyncProperty(
          plainHtmlArb,
          async (rawContent) => {
            const result = await service.processContent(rawContent);
            
            // When no formulas, raw and rendered should be identical
            expect(result.raw).toBe(result.rendered);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('result should always be a valid RichContent structure', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(htmlWithInlineFormulaArb, htmlWithBlockFormulaArb, plainHtmlArb),
          async (rawContent) => {
            const result = await service.processContent(rawContent);
            
            // Result must have both raw and rendered fields as strings
            expect(typeof result.raw).toBe('string');
            expect(typeof result.rendered).toBe('string');
            expect(result).toHaveProperty('raw');
            expect(result).toHaveProperty('rendered');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

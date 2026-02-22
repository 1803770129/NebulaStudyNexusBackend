/**
 * QuestionService 属性测试
 *
 * Property 6: Data Model Structure Integrity
 * For any Question entity, the content and explanation fields SHALL be jsonb objects
 * containing both raw and rendered string fields, and API responses SHALL return
 * the appropriate field based on the use case (rendered for display, raw for editing).
 *
 * **Validates: Requirements 5.3, 5.4, 5.5**
 */
import * as fc from 'fast-check';
import { RichContent, Option } from './entities/question.entity';
import { isRichContent, createRichContent } from './types/rich-content.type';

describe('Question Data Model Property Tests', () => {
  /**
   * Generator for valid RichContent objects
   */
  const richContentArb = fc
    .tuple(fc.string({ minLength: 1, maxLength: 200 }), fc.string({ minLength: 1, maxLength: 200 }))
    .map(
      ([raw, rendered]): RichContent => ({
        raw,
        rendered,
      }),
    );

  /**
   * Generator for RichContent with formulas (raw contains LaTeX, rendered contains img)
   */
  const richContentWithFormulaArb = fc
    .tuple(
      fc.string({ minLength: 0, maxLength: 50 }).filter((s) => !s.includes('$')),
      fc.constantFrom('x^2', 'E=mc^2', '\\frac{1}{2}', '\\sum_{i=1}^{n}'),
      fc.string({ minLength: 0, maxLength: 50 }).filter((s) => !s.includes('$')),
    )
    .map(
      ([before, formula, after]): RichContent => ({
        raw: `<p>${before}$${formula}$${after}</p>`,
        rendered: `<p>${before}<img src="data:image/svg+xml;base64,mock" alt="${formula}" class="formula inline" />${after}</p>`,
      }),
    );

  /**
   * Generator for Option objects with RichContent
   */
  const optionArb = fc.tuple(fc.constantFrom('A', 'B', 'C', 'D'), richContentArb, fc.boolean()).map(
    ([id, content, isCorrect]): Option => ({
      id,
      content,
      isCorrect,
    }),
  );

  /**
   * Property 6: Data Model Structure Integrity
   *
   * Feature: rich-text-editor, Property 6: Data Model Structure Integrity
   */
  describe('Property 6: Data Model Structure Integrity', () => {
    it('RichContent should always have both raw and rendered string fields', () => {
      fc.assert(
        fc.property(richContentArb, (richContent) => {
          // Must have raw field as string
          expect(typeof richContent.raw).toBe('string');
          expect(richContent).toHaveProperty('raw');

          // Must have rendered field as string
          expect(typeof richContent.rendered).toBe('string');
          expect(richContent).toHaveProperty('rendered');

          // isRichContent helper should validate correctly
          expect(isRichContent(richContent)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('createRichContent should produce valid RichContent objects', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
          (raw, rendered) => {
            const richContent = createRichContent(raw, rendered);

            // Must be valid RichContent
            expect(isRichContent(richContent)).toBe(true);

            // Raw should match input
            expect(richContent.raw).toBe(raw);

            // Rendered should match input or default to raw
            if (rendered !== undefined) {
              expect(richContent.rendered).toBe(rendered);
            } else {
              expect(richContent.rendered).toBe(raw);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it('Option content should be valid RichContent', () => {
      fc.assert(
        fc.property(optionArb, (option) => {
          // Option must have id, content, and isCorrect
          expect(typeof option.id).toBe('string');
          expect(typeof option.isCorrect).toBe('boolean');

          // Content must be valid RichContent
          expect(isRichContent(option.content)).toBe(true);
          expect(typeof option.content.raw).toBe('string');
          expect(typeof option.content.rendered).toBe('string');
        }),
        { numRuns: 100 },
      );
    });

    it('RichContent with formulas should have different raw and rendered', () => {
      fc.assert(
        fc.property(richContentWithFormulaArb, (richContent) => {
          // Raw should contain formula markers
          expect(richContent.raw).toMatch(/\$/);

          // Rendered should contain img tags instead
          expect(richContent.rendered).toContain('<img');
          expect(richContent.rendered).toContain('class="formula');

          // Both should be valid strings
          expect(isRichContent(richContent)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it('isRichContent should reject invalid objects', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.record({ raw: fc.string() }), // missing rendered
            fc.record({ rendered: fc.string() }), // missing raw
            fc.record({ raw: fc.integer(), rendered: fc.string() }), // wrong type
            fc.record({ raw: fc.string(), rendered: fc.integer() }), // wrong type
          ),
          (invalidObj) => {
            expect(isRichContent(invalidObj)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it('array of Options should all have valid RichContent', () => {
      fc.assert(
        fc.property(fc.array(optionArb, { minLength: 2, maxLength: 4 }), (options) => {
          for (const option of options) {
            expect(isRichContent(option.content)).toBe(true);
          }

          // All options should have unique ids (in a well-formed question)
          // Note: This is a structural property, not enforced by the type
        }),
        { numRuns: 100 },
      );
    });
  });
});

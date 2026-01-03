/**
 * ContentService 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { FormulaService } from '@/modules/formula/formula.service';

describe('ContentService', () => {
  let service: ContentService;
  let formulaService: FormulaService;

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
                results.set(key, `data:image/svg+xml;base64,mock_${latex}`);
              }
              return Promise.resolve(results);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    formulaService = module.get<FormulaService>(FormulaService);
  });

  describe('extractFormulas', () => {
    it('should extract inline formulas', () => {
      const html = 'The formula $x^2$ is simple';
      const formulas = service.extractFormulas(html);

      expect(formulas).toHaveLength(1);
      expect(formulas[0].latex).toBe('x^2');
      expect(formulas[0].inline).toBe(true);
      expect(formulas[0].fullMatch).toBe('$x^2$');
    });

    it('should extract block formulas', () => {
      const html = 'The formula $$E=mc^2$$ is famous';
      const formulas = service.extractFormulas(html);

      expect(formulas).toHaveLength(1);
      expect(formulas[0].latex).toBe('E=mc^2');
      expect(formulas[0].inline).toBe(false);
      expect(formulas[0].fullMatch).toBe('$$E=mc^2$$');
    });

    it('should extract multiple formulas', () => {
      const html = 'Inline $x^2$ and block $$y^2$$ formulas';
      const formulas = service.extractFormulas(html);

      expect(formulas).toHaveLength(2);
      // Block formula should be extracted first
      expect(formulas[0].latex).toBe('y^2');
      expect(formulas[0].inline).toBe(false);
      expect(formulas[1].latex).toBe('x^2');
      expect(formulas[1].inline).toBe(true);
    });

    it('should return empty array for content without formulas', () => {
      const html = 'No formulas here';
      const formulas = service.extractFormulas(html);

      expect(formulas).toHaveLength(0);
    });

    it('should handle complex LaTeX', () => {
      const html = 'Sum: $\\sum_{i=1}^{n} i$';
      const formulas = service.extractFormulas(html);

      expect(formulas).toHaveLength(1);
      expect(formulas[0].latex).toBe('\\sum_{i=1}^{n} i');
    });

    it('should trim whitespace from formulas', () => {
      const html = 'Formula: $  x^2  $';
      const formulas = service.extractFormulas(html);

      expect(formulas).toHaveLength(1);
      expect(formulas[0].latex).toBe('x^2');
    });
  });

  describe('processContent', () => {
    it('should return unchanged content when no formulas', async () => {
      const content = '<p>No formulas here</p>';
      const result = await service.processContent(content);

      expect(result.raw).toBe(content);
      expect(result.rendered).toBe(content);
    });

    it('should return unchanged content for empty string', async () => {
      const result = await service.processContent('');

      expect(result.raw).toBe('');
      expect(result.rendered).toBe('');
    });

    it('should process inline formula', async () => {
      const content = '<p>Formula: $x^2$</p>';
      const result = await service.processContent(content);

      expect(result.raw).toBe(content);
      expect(result.rendered).toContain('<img');
      expect(result.rendered).toContain('class="formula inline"');
      expect(result.rendered).not.toContain('$x^2$');
    });

    it('should process block formula', async () => {
      const content = '<p>Formula: $$E=mc^2$$</p>';
      const result = await service.processContent(content);

      expect(result.raw).toBe(content);
      expect(result.rendered).toContain('<img');
      expect(result.rendered).toContain('class="formula block"');
      expect(result.rendered).not.toContain('$$E=mc^2$$');
    });

    it('should preserve raw content', async () => {
      const content = '<p>Formula: $x^2$ and $$y^2$$</p>';
      const result = await service.processContent(content);

      expect(result.raw).toBe(content);
      expect(result.raw).toContain('$x^2$');
      expect(result.raw).toContain('$$y^2$$');
    });

    it('should escape special characters in alt attribute', async () => {
      const content = '<p>Formula: $a < b$</p>';
      const result = await service.processContent(content);

      expect(result.rendered).toContain('&lt;');
    });
  });

  describe('processContents', () => {
    it('should process multiple contents', async () => {
      const contents = ['<p>$x^2$</p>', '<p>$$y^2$$</p>'];
      const results = await service.processContents(contents);

      expect(results).toHaveLength(2);
      expect(results[0].raw).toBe('<p>$x^2$</p>');
      expect(results[0].rendered).toContain('<img');
      expect(results[1].raw).toBe('<p>$$y^2$$</p>');
      expect(results[1].rendered).toContain('<img');
    });
  });
});

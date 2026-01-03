/**
 * FormulaService 单元测试
 */
import { Test, TestingModule } from '@nestjs/testing';
import { FormulaService } from './formula.service';

describe('FormulaService', () => {
  let service: FormulaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormulaService],
    }).compile();

    service = module.get<FormulaService>(FormulaService);
  });

  describe('renderToSvg', () => {
    it('should render simple inline formula', async () => {
      const result = await service.renderToSvg('x^2', true);
      expect(result).not.toBeNull();
      expect(result).toContain('data:image/svg+xml;base64,');
    }, 10000);

    it('should render simple block formula', async () => {
      const result = await service.renderToSvg('E=mc^2', false);
      expect(result).not.toBeNull();
      expect(result).toContain('data:image/svg+xml;base64,');
    }, 10000);

    it('should render fraction formula', async () => {
      const result = await service.renderToSvg('\\frac{1}{2}', true);
      expect(result).not.toBeNull();
      expect(result).toContain('data:image/svg+xml;base64,');
    }, 10000);

    it('should render sum formula', async () => {
      const result = await service.renderToSvg('\\sum_{i=1}^{n} i', false);
      expect(result).not.toBeNull();
      expect(result).toContain('data:image/svg+xml;base64,');
    }, 10000);

    it('should return null for invalid LaTeX', async () => {
      const result = await service.renderToSvg('\\invalidcommand{', true);
      expect(result).toBeNull();
    }, 10000);
  });

  describe('renderBatch', () => {
    it('should render multiple formulas', async () => {
      const formulas = [
        { latex: 'x^2', inline: true },
        { latex: 'y^2', inline: true },
        { latex: 'E=mc^2', inline: false },
      ];

      const results = await service.renderBatch(formulas);

      expect(results.size).toBe(3);
      expect(results.get('inline:x^2')).toContain('data:image/svg+xml;base64,');
      expect(results.get('inline:y^2')).toContain('data:image/svg+xml;base64,');
      expect(results.get('block:E=mc^2')).toContain('data:image/svg+xml;base64,');
    }, 30000);

    it('should handle duplicate formulas', async () => {
      const formulas = [
        { latex: 'x^2', inline: true },
        { latex: 'x^2', inline: true },
      ];

      const results = await service.renderBatch(formulas);

      // Should only have one entry since they're duplicates
      expect(results.size).toBe(1);
    }, 10000);

    it('should handle empty array', async () => {
      const results = await service.renderBatch([]);
      expect(results.size).toBe(0);
    });
  });
});

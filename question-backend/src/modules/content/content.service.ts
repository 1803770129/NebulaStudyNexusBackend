/**
 * 内容处理服务
 * 
 * 职责：
 * 1. 解析富文本内容中的 LaTeX 公式
 * 2. 调用公式渲染服务转换公式
 * 3. 生成 RichContent 结构（raw + rendered）
 */
import { Injectable, Logger } from '@nestjs/common';
import { FormulaService } from '@/modules/formula/formula.service';

/**
 * 富文本内容结构
 */
export interface RichContent {
  /** 原始内容，包含 LaTeX 标记 */
  raw: string;
  /** 渲染后内容，公式已转为图片 */
  rendered: string;
}

/**
 * 提取的公式信息
 */
interface ExtractedFormula {
  /** 完整匹配（包含分隔符） */
  fullMatch: string;
  /** LaTeX 代码 */
  latex: string;
  /** 是否为行内公式 */
  inline: boolean;
}

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  /** 行内公式正则：$...$ (非贪婪匹配，不包含换行) */
  private readonly inlineFormulaRegex = /\$([^\$\n]+?)\$/g;

  /** 块级公式正则：$$...$$ (非贪婪匹配，可包含换行) */
  private readonly blockFormulaRegex = /\$\$([^\$]+?)\$\$/g;

  constructor(private readonly formulaService: FormulaService) {}

  /**
   * 提取内容中的所有 LaTeX 公式
   * @param html HTML 内容
   * @returns 提取的公式数组
   */
  extractFormulas(html: string): ExtractedFormula[] {
    const formulas: ExtractedFormula[] = [];

    // 先提取块级公式（避免被行内公式正则匹配）
    let match: RegExpExecArray | null;
    
    // 重置正则状态
    this.blockFormulaRegex.lastIndex = 0;
    while ((match = this.blockFormulaRegex.exec(html)) !== null) {
      formulas.push({
        fullMatch: match[0],
        latex: match[1].trim(),
        inline: false,
      });
    }

    // 提取行内公式（排除已匹配的块级公式位置）
    this.inlineFormulaRegex.lastIndex = 0;
    while ((match = this.inlineFormulaRegex.exec(html)) !== null) {
      // 检查是否是块级公式的一部分
      const isPartOfBlock = formulas.some(
        (f) => !f.inline && f.fullMatch.includes(match![0]),
      );
      if (!isPartOfBlock) {
        formulas.push({
          fullMatch: match[0],
          latex: match[1].trim(),
          inline: true,
        });
      }
    }

    return formulas;
  }

  /**
   * 处理富文本内容
   * @param rawContent 原始 HTML 内容（包含 LaTeX）
   * @returns 处理后的内容对象
   */
  async processContent(rawContent: string): Promise<RichContent> {
    if (!rawContent || rawContent.trim() === '') {
      return { raw: rawContent, rendered: rawContent };
    }

    // 提取公式
    const formulas = this.extractFormulas(rawContent);

    if (formulas.length === 0) {
      return { raw: rawContent, rendered: rawContent };
    }

    // 批量转换公式
    const formulaInputs = formulas.map((f) => ({
      latex: f.latex,
      inline: f.inline,
    }));
    const renderedFormulas = await this.formulaService.renderBatch(formulaInputs);

    // 替换公式为 img 标签
    let rendered = rawContent;
    for (const formula of formulas) {
      const key = `${formula.inline ? 'inline' : 'block'}:${formula.latex}`;
      const svgDataUri = renderedFormulas.get(key);

      if (svgDataUri) {
        // 成功转换，替换为 img 标签
        const imgTag = this.createFormulaImgTag(svgDataUri, formula.latex, formula.inline);
        rendered = rendered.replace(formula.fullMatch, imgTag);
      } else {
        // 转换失败，保留原始 LaTeX 代码并记录日志
        this.logger.warn(`公式转换失败，保留原始代码: ${formula.latex}`);
      }
    }

    return { raw: rawContent, rendered };
  }

  /**
   * 创建公式图片标签
   * @param src 图片源（data URI）
   * @param latex 原始 LaTeX 代码（用于 alt 属性）
   * @param inline 是否为行内公式
   * @returns img 标签 HTML
   */
  private createFormulaImgTag(src: string, latex: string, inline: boolean): string {
    const escapedLatex = latex
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    
    const style = inline
      ? 'vertical-align: middle; display: inline;'
      : 'display: block; margin: 10px auto;';

    return `<img src="${src}" alt="${escapedLatex}" class="formula ${inline ? 'inline' : 'block'}" style="${style}" />`;
  }

  /**
   * 批量处理内容数组
   * @param contents 原始内容数组
   * @returns 处理后的内容数组
   */
  async processContents(contents: string[]): Promise<RichContent[]> {
    return Promise.all(contents.map((content) => this.processContent(content)));
  }
}

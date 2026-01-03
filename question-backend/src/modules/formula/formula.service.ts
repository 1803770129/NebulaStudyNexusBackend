/**
 * 公式渲染服务
 * 
 * 职责：
 * 1. 将 LaTeX 公式转换为 SVG
 * 2. 支持批量转换
 * 3. 处理转换错误
 */
import { Injectable, Logger } from '@nestjs/common';
import * as mjAPI from 'mathjax-node';

@Injectable()
export class FormulaService {
  private readonly logger = new Logger(FormulaService.name);
  private initialized = false;

  constructor() {
    this.initMathJax();
  }

  /**
   * 初始化 MathJax
   */
  private initMathJax(): void {
    if (this.initialized) return;
    
    mjAPI.config({
      MathJax: {
        // 配置 MathJax
        SVG: {
          font: 'TeX',
        },
      },
    });
    mjAPI.start();
    this.initialized = true;
  }

  /**
   * 将 LaTeX 公式转换为 SVG
   * @param latex LaTeX 代码
   * @param inline 是否为行内公式
   * @returns SVG 字符串（data URI 格式）或 null（转换失败时）
   */
  async renderToSvg(latex: string, inline = false): Promise<string | null> {
    try {
      const result = await new Promise<{ svg?: string; errors?: string[] }>(
        (resolve, reject) => {
          mjAPI.typeset(
            {
              math: latex,
              format: inline ? 'inline-TeX' : 'TeX',
              svg: true,
            },
            (data) => {
              if (data.errors && data.errors.length > 0) {
                reject(new Error(data.errors.join(', ')));
              } else {
                resolve(data);
              }
            },
          );
        },
      );

      if (result.svg) {
        // 转换为 data URI
        const base64 = Buffer.from(result.svg).toString('base64');
        return `data:image/svg+xml;base64,${base64}`;
      }

      return null;
    } catch (error) {
      this.logger.error(`公式转换失败: ${latex}`, error);
      return null;
    }
  }

  /**
   * 批量转换公式
   * @param formulas LaTeX 公式数组，每个元素包含公式和是否行内
   * @returns 公式到图片 URL 的映射
   */
  async renderBatch(
    formulas: Array<{ latex: string; inline: boolean }>,
  ): Promise<Map<string, string | null>> {
    const results = new Map<string, string | null>();

    for (const { latex, inline } of formulas) {
      const key = `${inline ? 'inline' : 'block'}:${latex}`;
      if (!results.has(key)) {
        const svg = await this.renderToSvg(latex, inline);
        results.set(key, svg);
      }
    }

    return results;
  }
}

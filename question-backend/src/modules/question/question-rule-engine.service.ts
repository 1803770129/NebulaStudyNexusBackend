import { BadRequestException, Injectable } from '@nestjs/common';
import { QuestionType } from './enums/question-type.enum';

type QuestionAnswer = string | string[];

interface OptionLike {
  id: string;
  isCorrect: boolean;
}

export interface QuestionRulePayload {
  type: QuestionType;
  options?: OptionLike[] | null;
  answer: QuestionAnswer;
}

@Injectable()
export class QuestionRuleEngineService {
  validateOrThrow(payload: QuestionRulePayload): void {
    const options = payload.options ?? [];
    this.validateOptionIds(options);

    switch (payload.type) {
      case QuestionType.SINGLE_CHOICE:
        this.validateSingleChoice(options, payload.answer);
        return;
      case QuestionType.MULTIPLE_CHOICE:
        this.validateMultipleChoice(options, payload.answer);
        return;
      case QuestionType.TRUE_FALSE:
        this.validateTrueFalse(options, payload.answer);
        return;
      case QuestionType.FILL_BLANK:
        this.validateFillBlank(options, payload.answer);
        return;
      case QuestionType.SHORT_ANSWER:
        this.validateShortAnswer(options, payload.answer);
        return;
      default:
        throw new BadRequestException('不支持的题目类型');
    }
  }

  private validateSingleChoice(options: OptionLike[], answer: QuestionAnswer): void {
    this.ensureOptionsRequired(options, '单选题');

    const correctOptionIds = options.filter((option) => option.isCorrect).map((option) => option.id.trim());
    if (correctOptionIds.length !== 1) {
      throw new BadRequestException('单选题必须且只能有一个正确选项');
    }

    if (typeof answer !== 'string' || !answer.trim()) {
      throw new BadRequestException('单选题答案必须是非空字符串');
    }

    const normalizedAnswer = answer.trim();
    if (!options.some((option) => option.id.trim() === normalizedAnswer)) {
      throw new BadRequestException('单选题答案必须存在于选项中');
    }

    if (correctOptionIds[0] !== normalizedAnswer) {
      throw new BadRequestException('单选题答案必须与正确选项一致');
    }
  }

  private validateMultipleChoice(options: OptionLike[], answer: QuestionAnswer): void {
    this.ensureOptionsRequired(options, '多选题');

    const correctOptionIds = options.filter((option) => option.isCorrect).map((option) => option.id.trim());
    if (correctOptionIds.length < 2) {
      throw new BadRequestException('多选题至少需要两个正确选项');
    }

    if (!Array.isArray(answer) || answer.length === 0) {
      throw new BadRequestException('多选题答案必须是非空数组');
    }

    const normalizedAnswer = answer.map((item) => item.trim());
    if (normalizedAnswer.some((item) => !item)) {
      throw new BadRequestException('多选题答案数组不能包含空选项');
    }

    if (new Set(normalizedAnswer).size !== normalizedAnswer.length) {
      throw new BadRequestException('多选题答案不能包含重复选项');
    }

    const optionIdSet = new Set(options.map((option) => option.id.trim()));
    if (normalizedAnswer.some((item) => !optionIdSet.has(item))) {
      throw new BadRequestException('多选题答案必须存在于选项中');
    }

    if (!this.isSameSet(correctOptionIds, normalizedAnswer)) {
      throw new BadRequestException('多选题答案必须与正确选项集合一致');
    }
  }

  private validateTrueFalse(options: OptionLike[], answer: QuestionAnswer): void {
    if (typeof answer !== 'string' || !answer.trim()) {
      throw new BadRequestException('判断题答案必须是非空字符串');
    }

    const normalizedAnswer = answer.trim().toLowerCase();

    if (options.length === 0) {
      if (!['true', 'false'].includes(normalizedAnswer)) {
        throw new BadRequestException('判断题答案必须为 true 或 false');
      }
      return;
    }

    if (options.length !== 2) {
      throw new BadRequestException('判断题提供选项时，必须且只能有两个选项');
    }

    const correctOptionIds = options.filter((option) => option.isCorrect).map((option) => option.id.trim());
    if (correctOptionIds.length !== 1) {
      throw new BadRequestException('判断题必须且只能有一个正确选项');
    }

    if (!options.some((option) => option.id.trim() === answer.trim())) {
      throw new BadRequestException('判断题答案必须存在于选项中');
    }

    if (correctOptionIds[0] !== answer.trim()) {
      throw new BadRequestException('判断题答案必须与正确选项一致');
    }
  }

  private validateFillBlank(options: OptionLike[], answer: QuestionAnswer): void {
    if (options.length > 0) {
      throw new BadRequestException('填空题不允许配置选项');
    }

    if (!Array.isArray(answer) || answer.length === 0) {
      throw new BadRequestException('填空题答案必须是非空字符串数组');
    }

    const normalized = answer.map((item) => item.trim());
    if (normalized.some((item) => !item)) {
      throw new BadRequestException('填空题答案不能包含空字符串');
    }
  }

  private validateShortAnswer(options: OptionLike[], answer: QuestionAnswer): void {
    if (options.length > 0) {
      throw new BadRequestException('简答题不允许配置选项');
    }

    if (typeof answer !== 'string' || !answer.trim()) {
      throw new BadRequestException('简答题答案必须是非空字符串');
    }
  }

  private ensureOptionsRequired(options: OptionLike[], typeLabel: string): void {
    if (options.length < 2) {
      throw new BadRequestException(`${typeLabel}至少需要两个选项`);
    }
  }

  private validateOptionIds(options: OptionLike[]): void {
    const normalized = options.map((option) => option.id.trim());
    if (normalized.some((id) => !id)) {
      throw new BadRequestException('选项ID不能为空');
    }

    if (new Set(normalized).size !== normalized.length) {
      throw new BadRequestException('选项ID不能重复');
    }
  }

  private isSameSet(left: string[], right: string[]): boolean {
    if (left.length !== right.length) {
      return false;
    }

    const set = new Set(left);
    for (const value of right) {
      if (!set.has(value)) {
        return false;
      }
    }
    return true;
  }
}

import { BadRequestException } from '@nestjs/common';
import { QuestionRuleEngineService } from './question-rule-engine.service';
import { QuestionType } from './enums/question-type.enum';

describe('QuestionRuleEngineService', () => {
  let service: QuestionRuleEngineService;

  beforeEach(() => {
    service = new QuestionRuleEngineService();
  });

  it('should pass for valid single choice', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.SINGLE_CHOICE,
        options: [
          { id: 'A', isCorrect: true },
          { id: 'B', isCorrect: false },
        ],
        answer: 'A',
      }),
    ).not.toThrow();
  });

  it('should reject single choice with multiple correct options', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.SINGLE_CHOICE,
        options: [
          { id: 'A', isCorrect: true },
          { id: 'B', isCorrect: true },
        ],
        answer: 'A',
      }),
    ).toThrow(BadRequestException);
  });

  it('should pass for valid multiple choice', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { id: 'A', isCorrect: true },
          { id: 'B', isCorrect: true },
          { id: 'C', isCorrect: false },
        ],
        answer: ['A', 'B'],
      }),
    ).not.toThrow();
  });

  it('should reject multiple choice with non-matching answer set', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.MULTIPLE_CHOICE,
        options: [
          { id: 'A', isCorrect: true },
          { id: 'B', isCorrect: true },
          { id: 'C', isCorrect: false },
        ],
        answer: ['A', 'C'],
      }),
    ).toThrow(BadRequestException);
  });

  it('should pass true/false without options when answer is true or false', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.TRUE_FALSE,
        answer: 'true',
        options: [],
      }),
    ).not.toThrow();
  });

  it('should reject true/false answer if not true/false when options are empty', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.TRUE_FALSE,
        answer: 'yes',
        options: [],
      }),
    ).toThrow(BadRequestException);
  });

  it('should reject fill blank with options', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.FILL_BLANK,
        options: [
          { id: 'A', isCorrect: true },
          { id: 'B', isCorrect: false },
        ],
        answer: ['x'],
      }),
    ).toThrow(BadRequestException);
  });

  it('should pass fill blank with non-empty string array answer', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.FILL_BLANK,
        options: [],
        answer: ['x', 'y'],
      }),
    ).not.toThrow();
  });

  it('should reject short answer with empty string', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.SHORT_ANSWER,
        options: [],
        answer: ' ',
      }),
    ).toThrow(BadRequestException);
  });

  it('should reject duplicated option ids', () => {
    expect(() =>
      service.validateOrThrow({
        type: QuestionType.SINGLE_CHOICE,
        options: [
          { id: 'A', isCorrect: true },
          { id: 'A', isCorrect: false },
        ],
        answer: 'A',
      }),
    ).toThrow(BadRequestException);
  });
});

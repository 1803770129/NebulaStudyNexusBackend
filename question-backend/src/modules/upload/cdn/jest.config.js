/**
 * Jest 配置 - CDN 混合降级方案测试
 * 
 * 配置属性测试和单元测试
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/*.spec.ts', '**/*.pbt.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.spec.ts',
    '!**/*.pbt.spec.ts',
    '!**/interfaces.ts',
    '!**/jest.config.js',
  ],
  coverageDirectory: '../../../../coverage/cdn',
  coverageThresholds: {
    global: {
      lines: 80,
      branches: 75,
      functions: 85,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../../../../src/$1',
  },
  testTimeout: 30000, // 30 秒超时（考虑网络请求）
};

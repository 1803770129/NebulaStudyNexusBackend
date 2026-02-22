import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { HealthMonitor } from './health-monitor.service';
import { CDNService } from './cdn.service';
import { CDNType } from './interfaces';

// Mock fetch globally
global.fetch = jest.fn();

describe('HealthMonitor', () => {
  let service: HealthMonitor;
  let cdnService: CDNService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        'github.repo': 'test-owner/test-repo',
        'github.branch': 'main',
        'cdn.timeout': 5000,
        'cdn.priority': ['statically', 'github', 'proxy'],
        'cdn.enabledCDNs.statically': true,
        'cdn.enabledCDNs.github': true,
        'cdn.enabledCDNs.proxy': true,
        'cdn.cacheTTL': 86400000,
        'cdn.healthCheck.testImage': 'test.jpg',
        'cdn.healthCheck.cacheInterval': 60000,
        'app.baseUrl': 'http://localhost:3000',
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthMonitor,
        CDNService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<HealthMonitor>(HealthMonitor);
    cdnService = module.get<CDNService>(CDNService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return healthy status when CDN responds successfully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.checkHealth('statically');

      expect(result.healthy).toBe(true);
      expect(result.cdnType).toBe('statically');
      expect(result.responseTime).toBeDefined();
      expect(result.error).toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('cdn.statically.io'),
        expect.objectContaining({ method: 'HEAD' }),
      );
    });

    it('should return unhealthy status when CDN returns error status', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await service.checkHealth('github');

      expect(result.healthy).toBe(false);
      expect(result.cdnType).toBe('github');
      expect(result.error).toContain('HTTP 404');
    });

    it('should return unhealthy status when request times out', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('The operation was aborted')), 100),
          ),
      );

      const result = await service.checkHealth('statically');

      expect(result.healthy).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should use cached result within cache interval', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      // First call - should hit the CDN
      const result1 = await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const result2 = await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, not 2
      expect(result2.lastCheck).toBe(result1.lastCheck);
    });

    it('should perform new check after cache expires', async () => {
      jest.useFakeTimers();
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      // First call
      await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time beyond cache interval
      jest.advanceTimersByTime(61000); // 61 seconds

      // Second call - should perform new check
      await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should check proxy service with full URL', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      await service.checkHealth('proxy');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/upload/proxy/test.jpg',
        expect.objectContaining({ method: 'HEAD' }),
      );
    });
  });

  describe('getAllHealthStatus', () => {
    it('should return health status for all CDN types', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await service.getAllHealthStatus();

      expect(result).toHaveProperty('statically');
      expect(result).toHaveProperty('github');
      expect(result).toHaveProperty('proxy');
      expect(result.statically.healthy).toBe(true);
      expect(result.github.healthy).toBe(true);
      expect(result.proxy.healthy).toBe(true);
    });

    it('should handle mixed health statuses', async () => {
      const mockFetch = global.fetch as jest.Mock;
      let callCount = 0;
      mockFetch.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ ok: true, status: 200, statusText: 'OK' });
        } else if (callCount === 2) {
          return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' });
        } else {
          return Promise.reject(new Error('Network error'));
        }
      });

      const result = await service.getAllHealthStatus();

      expect(result.statically.healthy).toBe(true);
      expect(result.github.healthy).toBe(false);
      expect(result.proxy.healthy).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockRejectedValue(new Error('Network failure'));

      const result = await service.getAllHealthStatus();

      expect(result.statically.healthy).toBe(false);
      expect(result.github.healthy).toBe(false);
      expect(result.proxy.healthy).toBe(false);
      expect(result.statically.error).toContain('Network failure');
    });
  });

  describe('clearCache', () => {
    it('should clear all cached health statuses', async () => {
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      // Populate cache
      await service.checkHealth('statically');
      await service.checkHealth('github');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Clear cache
      service.clearCache();

      // Next calls should hit the CDN again
      await service.checkHealth('statically');
      await service.checkHealth('github');
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('cleanupExpiredCache', () => {
    it('should remove expired cache entries', async () => {
      jest.useFakeTimers();
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      // Create cache entry
      await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time to expire cache
      jest.advanceTimersByTime(61000);

      // Cleanup expired entries
      service.cleanupExpiredCache();

      // Next call should perform new check
      await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
    });

    it('should not remove non-expired cache entries', async () => {
      jest.useFakeTimers();
      const mockFetch = global.fetch as jest.Mock;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      // Create cache entry
      await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time but not enough to expire
      jest.advanceTimersByTime(30000);

      // Cleanup - should not remove anything
      service.cleanupExpiredCache();

      // Next call should still use cache
      await service.checkHealth('statically');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });
});

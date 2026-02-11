import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CDNService } from './cdn.service';

describe('CDNService', () => {
  let service: CDNService;
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
      };
      return config[key] ?? defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CDNService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CDNService>(CDNService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateStaticallyURL', () => {
    it('should generate correct Statically CDN URL', () => {
      const filename = 'test-image.jpg';
      const url = service.generateStaticallyURL(filename);
      
      expect(url).toBe('https://cdn.statically.io/gh/test-owner/test-repo@main/images/test-image.jpg');
    });
  });

  describe('generateGitHubRawURL', () => {
    it('should generate correct GitHub Raw URL', () => {
      const filename = 'test-image.jpg';
      const url = service.generateGitHubRawURL(filename);
      
      expect(url).toBe('https://raw.githubusercontent.com/test-owner/test-repo/main/images/test-image.jpg');
    });
  });

  describe('generateProxyURL', () => {
    it('should generate correct proxy URL', () => {
      const filename = 'test-image.jpg';
      const url = service.generateProxyURL(filename);
      
      expect(url).toBe('/api/upload/proxy/test-image.jpg');
    });
  });

  describe('generateFallbackURLs', () => {
    it('should generate complete fallback chain with all CDNs enabled', () => {
      const filename = 'test-image.jpg';
      const result = service.generateFallbackURLs(filename);
      
      expect(result.filename).toBe(filename);
      expect(result.urls).toHaveLength(3);
      expect(result.urls[0]).toContain('statically');
      expect(result.urls[1]).toContain('raw.githubusercontent');
      expect(result.urls[2]).toContain('/api/upload/proxy/');
      expect(result.primary).toBe(result.urls[0]);
    });

    it('should respect CDN priority order', () => {
      // Create a new service with custom priority
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            'github.repo': 'test-owner/test-repo',
            'github.branch': 'main',
            'cdn.timeout': 5000,
            'cdn.priority': ['github', 'statically', 'proxy'],
            'cdn.enabledCDNs.statically': true,
            'cdn.enabledCDNs.github': true,
            'cdn.enabledCDNs.proxy': true,
            'cdn.cacheTTL': 86400000,
          };
          return config[key] ?? defaultValue;
        }),
      };

      const customService = new CDNService(customConfigService as any);
      const result = customService.generateFallbackURLs('test.jpg');
      
      expect(result.urls[0]).toContain('raw.githubusercontent');
      expect(result.urls[1]).toContain('statically');
      expect(result.urls[2]).toContain('/api/upload/proxy/');
    });

    it('should exclude disabled CDNs from fallback chain', () => {
      // Create a new service with statically disabled
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            'github.repo': 'test-owner/test-repo',
            'github.branch': 'main',
            'cdn.timeout': 5000,
            'cdn.priority': ['statically', 'github', 'proxy'],
            'cdn.enabledCDNs.statically': false,
            'cdn.enabledCDNs.github': true,
            'cdn.enabledCDNs.proxy': true,
            'cdn.cacheTTL': 86400000,
          };
          return config[key] ?? defaultValue;
        }),
      };

      const customService = new CDNService(customConfigService as any);
      const result = customService.generateFallbackURLs('test.jpg');
      
      expect(result.urls).toHaveLength(2);
      expect(result.urls[0]).toContain('raw.githubusercontent');
      expect(result.urls[1]).toContain('/api/upload/proxy/');
      expect(result.urls.some(url => url.includes('statically'))).toBe(false);
    });

    it('should return proxy URL when all CDNs are disabled', () => {
      // Create a new service with all CDNs disabled
      const customConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          const config: Record<string, any> = {
            'github.repo': 'test-owner/test-repo',
            'github.branch': 'main',
            'cdn.timeout': 5000,
            'cdn.priority': ['statically', 'github', 'proxy'],
            'cdn.enabledCDNs.statically': false,
            'cdn.enabledCDNs.github': false,
            'cdn.enabledCDNs.proxy': false,
            'cdn.cacheTTL': 86400000,
          };
          return config[key] ?? defaultValue;
        }),
      };

      const customService = new CDNService(customConfigService as any);
      const result = customService.generateFallbackURLs('test.jpg');
      
      expect(result.urls).toHaveLength(1);
      expect(result.urls[0]).toContain('/api/upload/proxy/');
    });
  });

  describe('loadConfig', () => {
    it('should throw error when GITHUB_REPO is missing', () => {
      const invalidConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'github.repo') return undefined;
          return defaultValue;
        }),
      };

      expect(() => CDNService.loadConfig(invalidConfigService as any)).toThrow(
        'GITHUB_REPO environment variable is required'
      );
    });

    it('should use default values when optional configs are missing', () => {
      const minimalConfigService = {
        get: jest.fn((key: string, defaultValue?: any) => {
          if (key === 'github.repo') return 'test-owner/test-repo';
          return defaultValue;
        }),
      };

      const config = CDNService.loadConfig(minimalConfigService as any);
      
      expect(config.githubBranch).toBe('main');
      expect(config.timeout).toBe(5000);
      expect(config.cacheTTL).toBe(86400000);
      expect(config.priority).toEqual(['statically', 'github', 'proxy']);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      const config = service.getConfig();
      
      expect(config).toBeDefined();
      expect(config.githubRepo).toBe('test-owner/test-repo');
      expect(config.timeout).toBe(5000);
      
      // Verify it's a copy, not the original
      config.timeout = 10000;
      expect(service.getConfig().timeout).toBe(5000);
    });
  });
});

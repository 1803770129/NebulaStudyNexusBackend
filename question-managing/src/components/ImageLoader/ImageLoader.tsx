import { Component, createRef, type ReactElement } from 'react';
import type { ImageLoaderProps, ImageLoaderState } from '@/services/cdn/types';
import './ImageLoader.css';

/**
 * ImageLoader 组件
 * 
 * 处理图片加载、自动降级重试和状态展示
 * 支持懒加载和自定义超时
 */
export class ImageLoader extends Component<ImageLoaderProps, ImageLoaderState> {
  private imgRef = createRef<HTMLImageElement>();
  private observer: IntersectionObserver | null = null;
  private loadTimeout: NodeJS.Timeout | null = null;
  private containerRef = createRef<HTMLDivElement>();

  constructor(props: ImageLoaderProps) {
    super(props);
    this.state = {
      status: 'loading',
      currentUrlIndex: 0,
      urls: props.fallbackUrls || [],
      retryCount: 0,
    };
  }

  componentDidMount(): void {
    const { lazy = true } = this.props;

    if (lazy) {
      this.setupLazyLoading();
    } else {
      this.startLoading();
    }
  }

  componentWillUnmount(): void {
    this.cleanup();
  }

  /**
   * 设置懒加载
   */
  private setupLazyLoading(): void {
    if (!this.containerRef.current) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.startLoading();
            this.observer?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
      }
    );

    this.observer.observe(this.containerRef.current);
  }

  /**
   * 开始加载流程
   */
  private startLoading(): void {
    const { fallbackUrls } = this.props;

    // 如果没有提供 fallbackUrls，需要从后端获取
    if (!fallbackUrls || fallbackUrls.length === 0) {
      this.fetchFallbackUrls();
    } else {
      // 转换所有 jsDelivr URL 为 Statically URL
      const convertedUrls = fallbackUrls.map(url => this.convertJsDelivrToStatically(url));
      this.setState({ urls: convertedUrls }, () => {
        this.loadImage(convertedUrls[0], this.props.timeout || 5000);
      });
    }
  }

  /**
   * 从后端获取降级 URL
   */
  private async fetchFallbackUrls(): Promise<void> {
    try {
      // TODO: 实际实现需要调用后端 API 获取降级 URL
      // 这里暂时使用占位实现
      const { filename } = this.props;
      
      // 如果没有文件名，直接进入错误状态
      if (!filename) {
        this.handleError(new Error('No filename provided'));
        return;
      }
      
      const urls = [
        `https://cdn.statically.io/gh/user/repo@main/${filename}`,
        `https://raw.githubusercontent.com/user/repo/main/${filename}`,
        `/api/upload/proxy/${filename}`,
      ];
      
      // 转换所有 jsDelivr URL 为 Statically URL
      const convertedUrls = urls.map(url => this.convertJsDelivrToStatically(url));
      
      this.setState({ urls: convertedUrls }, () => {
        this.loadImage(convertedUrls[0], this.props.timeout || 5000);
      });
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  /**
   * 加载图片，带超时和降级逻辑
   */
  private loadImage(url: string, timeout: number): void {
    const img = new Image();
    let timeoutReached = false;

    // 设置超时
    this.loadTimeout = setTimeout(() => {
      timeoutReached = true;
      this.logError('timeout', url, 'Image load timeout');
      this.tryNextUrl();
    }, timeout);

    img.onload = () => {
      if (timeoutReached) return;
      
      this.clearLoadTimeout();
      this.setState({ status: 'loaded' });
      
      if (this.props.onLoad) {
        this.props.onLoad();
      }

      // 记录成功加载
      this.logSuccess(url);
    };

    img.onerror = () => {
      if (timeoutReached) return;
      
      this.clearLoadTimeout();
      this.logError('network', url, 'Image load failed');
      this.tryNextUrl();
    };

    img.src = url;
  }

  /**
   * 尝试下一个降级 URL
   */
  private tryNextUrl(): void {
    const { currentUrlIndex, urls } = this.state;
    const nextIndex = currentUrlIndex + 1;

    if (nextIndex < urls.length) {
      this.setState(
        {
          currentUrlIndex: nextIndex,
        },
        () => {
          this.loadImage(urls[nextIndex], this.props.timeout || 5000);
        }
      );
    } else {
      // 所有 URL 都失败了
      this.setState({ status: 'error' });
      
      const error = new Error('All fallback URLs failed');
      this.logError('all_failed', '', 'All fallback URLs exhausted');
      
      if (this.props.onError) {
        this.props.onError(error);
      }
    }
  }

  /**
   * 手动重试（从第一个 URL 开始）
   */
  private retry = (): void => {
    this.setState(
      (prevState) => ({
        status: 'loading',
        currentUrlIndex: 0,
        retryCount: prevState.retryCount + 1,
      }),
      () => {
        const { urls } = this.state;
        if (urls.length > 0) {
          this.loadImage(urls[0], this.props.timeout || 5000);
        } else {
          this.startLoading();
        }
      }
    );
  };

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.clearLoadTimeout();
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  /**
   * 清除加载超时
   */
  private clearLoadTimeout(): void {
    if (this.loadTimeout) {
      clearTimeout(this.loadTimeout);
      this.loadTimeout = null;
    }
  }

  /**
   * 记录错误日志
   */
  private logError(errorType: string, url: string, message: string): void {
    console.error('[ImageLoader]', {
      timestamp: new Date().toISOString(),
      level: 'error',
      component: 'ImageLoader',
      operation: 'loadImage',
      filename: this.props.filename,
      url,
      errorType,
      errorMessage: message,
    });
  }

  /**
   * 记录成功日志
   */
  private logSuccess(url: string): void {
    const { currentUrlIndex } = this.state;
    
    if (currentUrlIndex > 0) {
      // 降级成功，记录警告
      console.warn('[ImageLoader]', {
        timestamp: new Date().toISOString(),
        level: 'warn',
        component: 'ImageLoader',
        operation: 'loadImage',
        filename: this.props.filename,
        message: 'Fallback URL succeeded',
        successUrl: url,
        failedUrls: this.state.urls.slice(0, currentUrlIndex),
      });
    }
  }

  /**
   * 处理错误
   */
  private handleError(error: Error): void {
    this.setState({ status: 'error' });
    this.logError('fetch_urls', '', error.message);
    
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  /**
   * 检测是否为 jsDelivr URL
   */
  private isJsDelivrURL(url: string): boolean {
    return url.startsWith('https://cdn.jsdelivr.net/gh/');
  }

  /**
   * 将 jsDelivr URL 转换为 Statically URL
   * 
   * 格式转换：
   * - jsDelivr: https://cdn.jsdelivr.net/gh/{owner}/{repo}@{branch}/{path}
   * - Statically: https://cdn.statically.io/gh/{owner}/{repo}@{branch}/{path}
   * 
   * @param url 原始 URL
   * @returns 转换后的 URL（如果不是 jsDelivr URL 则返回原 URL）
   */
  private convertJsDelivrToStatically(url: string): string {
    if (!this.isJsDelivrURL(url)) {
      return url;
    }

    // 提取 jsDelivr URL 的各个部分
    const jsDelivrPattern = /https:\/\/cdn\.jsdelivr\.net\/gh\/([^\/]+)\/([^@]+)@([^\/]+)\/(.+)/;
    const match = url.match(jsDelivrPattern);

    if (!match) {
      return url;
    }

    const [, owner, repo, branch, path] = match;
    const convertedUrl = `https://cdn.statically.io/gh/${owner}/${repo}@${branch}/${path}`;
    
    // 记录转换日志
    console.info('[ImageLoader]', {
      timestamp: new Date().toISOString(),
      level: 'info',
      component: 'ImageLoader',
      operation: 'convertJsDelivrToStatically',
      message: 'Converted jsDelivr URL to Statically URL',
      originalUrl: url,
      convertedUrl,
    });

    return convertedUrl;
  }

  render(): ReactElement {
    const { status, urls, currentUrlIndex } = this.state;
    const { alt, className, filename } = this.props;

    return (
      <div
        ref={this.containerRef}
        className={`image-loader ${className || ''}`}
        data-status={status}
      >
        {status === 'loading' && (
          <div className="image-loader__skeleton">
            <div className="image-loader__spinner" />
            <span className="image-loader__loading-text">加载中...</span>
          </div>
        )}

        {status === 'loaded' && urls[currentUrlIndex] && (
          <img
            ref={this.imgRef}
            src={urls[currentUrlIndex]}
            alt={alt || filename}
            className="image-loader__image"
          />
        )}

        {status === 'error' && (
          <div className="image-loader__error">
            <div className="image-loader__error-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" />
                <path d="M24 16V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="24" cy="32" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <p className="image-loader__error-text">图片加载失败</p>
            <button
              className="image-loader__retry-button"
              onClick={this.retry}
              type="button"
            >
              重试
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default ImageLoader;

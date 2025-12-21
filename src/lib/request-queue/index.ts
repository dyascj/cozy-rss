/**
 * Request Queue System for RSS Feeds
 *
 * Provides rate limiting, request deduplication, caching, and exponential backoff
 * to prevent hitting rate limits when scaling to many users/feeds.
 */

interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: number;
  retryCount: number;
  maxRetries: number;
  addedAt: number;
}

interface RequestQueueOptions {
  /** Maximum concurrent requests */
  concurrency: number;
  /** Minimum delay between requests in ms */
  minDelay: number;
  /** Maximum requests per time window */
  rateLimit: number;
  /** Time window for rate limiting in ms */
  rateLimitWindow: number;
  /** Default max retries for failed requests */
  defaultMaxRetries: number;
  /** Base delay for exponential backoff in ms */
  baseBackoffDelay: number;
  /** Maximum backoff delay in ms */
  maxBackoffDelay: number;
}

const DEFAULT_OPTIONS: RequestQueueOptions = {
  concurrency: 3,
  minDelay: 100,
  rateLimit: 30,
  rateLimitWindow: 60000, // 1 minute
  defaultMaxRetries: 3,
  baseBackoffDelay: 1000,
  maxBackoffDelay: 30000,
};

export class RequestQueue {
  private queue: QueuedRequest<unknown>[] = [];
  private activeRequests = 0;
  private requestTimestamps: number[] = [];
  private options: RequestQueueOptions;
  private isProcessing = false;
  private pendingRequests = new Map<string, Promise<unknown>>();

  constructor(options: Partial<RequestQueueOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Add a request to the queue with deduplication
   * If an identical request is already pending, return that promise instead
   */
  async enqueue<T>(
    id: string,
    execute: () => Promise<T>,
    options: { priority?: number; maxRetries?: number } = {}
  ): Promise<T> {
    // Check for existing pending request with same ID (deduplication)
    const existing = this.pendingRequests.get(id);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<unknown> = {
        id,
        execute: execute as () => Promise<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
        priority: options.priority ?? 0,
        retryCount: 0,
        maxRetries: options.maxRetries ?? this.options.defaultMaxRetries,
        addedAt: Date.now(),
      };

      // Insert by priority (higher priority first)
      const insertIndex = this.queue.findIndex(
        (r) => r.priority < request.priority
      );
      if (insertIndex === -1) {
        this.queue.push(request);
      } else {
        this.queue.splice(insertIndex, 0, request);
      }
    });

    this.pendingRequests.set(id, promise);

    // Clean up pending request map when done
    promise
      .finally(() => {
        this.pendingRequests.delete(id);
      })
      .catch(() => {}); // Prevent unhandled rejection

    this.processQueue();

    return promise;
  }

  /**
   * Check if we're within rate limits
   */
  private canMakeRequest(): boolean {
    const now = Date.now();

    // Clean old timestamps
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => now - ts < this.options.rateLimitWindow
    );

    // Check rate limit
    if (this.requestTimestamps.length >= this.options.rateLimit) {
      return false;
    }

    // Check concurrency
    if (this.activeRequests >= this.options.concurrency) {
      return false;
    }

    return true;
  }

  /**
   * Calculate backoff delay with jitter
   */
  private getBackoffDelay(retryCount: number): number {
    const exponentialDelay =
      this.options.baseBackoffDelay * Math.pow(2, retryCount);
    const cappedDelay = Math.min(exponentialDelay, this.options.maxBackoffDelay);
    // Add jitter (±25%)
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);
    return Math.floor(cappedDelay + jitter);
  }

  /**
   * Process the queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      if (!this.canMakeRequest()) {
        // Wait before checking again
        await this.delay(this.options.minDelay);
        continue;
      }

      const request = this.queue.shift();
      if (!request) continue;

      this.activeRequests++;
      this.requestTimestamps.push(Date.now());

      this.executeRequest(request);

      // Small delay between starting requests
      await this.delay(this.options.minDelay);
    }

    this.isProcessing = false;
  }

  /**
   * Execute a single request with retry logic
   */
  private async executeRequest(request: QueuedRequest<unknown>): Promise<void> {
    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      if (request.retryCount < request.maxRetries) {
        // Retry with backoff
        request.retryCount++;
        const backoffDelay = this.getBackoffDelay(request.retryCount);

        console.warn(
          `Request ${request.id} failed, retrying in ${backoffDelay}ms (attempt ${request.retryCount}/${request.maxRetries})`
        );

        await this.delay(backoffDelay);

        // Re-add to front of queue with same priority
        this.queue.unshift(request);
        this.processQueue();
      } else {
        request.reject(
          error instanceof Error
            ? error
            : new Error(String(error))
        );
      }
    } finally {
      this.activeRequests--;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get queue statistics
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      requestsInWindow: this.requestTimestamps.length,
      pendingDeduplicatedRequests: this.pendingRequests.size,
    };
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.queue.forEach((request) => {
      request.reject(new Error("Queue cleared"));
    });
    this.queue = [];
  }
}

// Singleton instance for feed fetching
export const feedRequestQueue = new RequestQueue({
  concurrency: 3,
  minDelay: 100,
  rateLimit: 60, // 60 requests per minute
  rateLimitWindow: 60000,
  defaultMaxRetries: 3,
  baseBackoffDelay: 1000,
  maxBackoffDelay: 30000,
});

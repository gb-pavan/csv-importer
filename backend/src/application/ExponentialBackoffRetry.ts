export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

const defaultOptions: RetryOptions = {
  maxAttempts: 4,
  initialDelayMs: 500,
  maxDelayMs: 8_000,
};

export class ExponentialBackoffRetry {
  constructor(private readonly options: RetryOptions = defaultOptions) {}

  public async execute<T>(operation: () => Promise<T>, label: string): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === this.options.maxAttempts || !this.isRetryable(error)) {
          throw error;
        }

        const delayMs = this.getDelay(attempt);
        console.warn(
          `${label} failed (attempt ${attempt}/${this.options.maxAttempts}). Retrying in ${delayMs}ms.`,
          error,
        );
        await this.sleep(delayMs);
      }
    }

    throw lastError;
  }

  private isRetryable(error: unknown): boolean {
    const candidate = error as { status?: number; code?: string; response?: { status?: number } };
    const status = candidate?.status ?? candidate?.response?.status;
    const retryableCodes = new Set(["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"]);

    return status === 408 || status === 429 || (typeof status === "number" && status >= 500)
      || retryableCodes.has(candidate?.code ?? "");
  }

  private getDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.options.initialDelayMs * 2 ** (attempt - 1),
      this.options.maxDelayMs,
    );
    const jitter = 0.8 + Math.random() * 0.4;

    return Math.round(exponentialDelay * jitter);
  }

  private sleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

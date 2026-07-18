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

        const delayMs = this.getDelay(attempt, error);
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
    const candidate = error as {
      status?: number;
      code?: string;
      retryable?: boolean;
      response?: { status?: number };
    };
    const status = candidate?.status ?? candidate?.response?.status;
    const retryableCodes = new Set(["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "ENOTFOUND"]);

    return candidate?.retryable === true || status === 408 || status === 429 || (typeof status === "number" && status >= 500)
      || retryableCodes.has(candidate?.code ?? "");
  }

  private getDelay(attempt: number, error: unknown): number {
    const exponentialDelay = Math.min(
      this.options.initialDelayMs * 2 ** (attempt - 1),
      this.options.maxDelayMs,
    );
    const retryAfterMs = this.getRetryAfterMs(error);

    // Gemini supplies a RetryInfo delay with quota responses. Retrying before
    // that time only consumes attempts and guarantees another 429 response.
    if (retryAfterMs !== null) {
      return Math.max(exponentialDelay, retryAfterMs);
    }

    const jitter = 0.8 + Math.random() * 0.4;

    return Math.round(exponentialDelay * jitter);
  }

  private getRetryAfterMs(error: unknown): number | null {
    const message = error instanceof Error ? error.message : String(error);
    const match = message.match(
      /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"|Please retry in\s+(\d+(?:\.\d+)?)s/i,
    );
    const seconds = Number(match?.[1] ?? match?.[2]);

    return Number.isFinite(seconds) && seconds > 0
      ? Math.ceil(seconds * 1_000)
      : null;
  }

  private sleep(delayMs: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

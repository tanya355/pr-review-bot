export class QuotaExceededError extends Error {
  constructor(message: string = "OpenAI API quota exceeded") {
    super(message);
    this.name = "QuotaExceededError";
  }
}

export class APIError extends Error {
  public statusCode?: number;
  public originalError?: unknown;

  constructor(message: string, statusCode?: number, originalError?: unknown) {
    super(message);
    this.name = "APIError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

export function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("quota") ||
      message.includes("billing") ||
      message.includes("exceeded")
    );
  }
  return false;
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}

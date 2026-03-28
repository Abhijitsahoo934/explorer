type ErrorWithMessage = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function isErrorWithMessage(value: unknown): value is ErrorWithMessage {
  return typeof value === 'object' && value !== null;
}

export function getErrorMessage(error: unknown, fallback = 'Unexpected error'): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (isErrorWithMessage(error)) {
    const parts = [error.message, error.details, error.hint]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0);

    if (parts.length > 0) {
      return parts.join(' ');
    }

    if (typeof error.code === 'string' && error.code.trim()) {
      return `Request failed (${error.code}).`;
    }
  }

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallback;
}

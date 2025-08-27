// src/utils/safeError.ts
export type SafeError = { name: string; message: string; stack?: string };

export function safeError(err: unknown): SafeError {
  if (err instanceof Error) {
    return { name: err.name || "Error", message: err.message || "Error", stack: err.stack };
  }
  if (typeof err === "string") {
    return { name: "StringError", message: err };
  }
  if (err && typeof err === "object") {
    const anyErr = err as any;
    return {
      name: anyErr.name ?? "ObjectError",
      message: anyErr.message ?? JSON.stringify(anyErr),
      stack: anyErr.stack,
    };
  }
  return { name: "UnknownError", message: "An unknown error occurred" };
}

// src/utils/withErrorHandling.ts
import { safeError } from "./safeError";

type Fail = { success: false; name: string; message: string; stack?: string };
type Ok<T> = { success: true } & T;

/**
 * Wrap server functions so they always return { success: true, ... } or { success: false, name, message }.
 */
export function withErrorHandling<I extends any[], O extends object>(
  fn: (...args: I) => Promise<O> | O
) {
  return async (...args: I): Promise<Ok<O> | Fail> => {
    try {
      const data = await fn(...args);
      return { success: true, ...data } as Ok<O>;
    } catch (e) {
      const err = safeError(e);
      console.error("[withErrorHandling]", err.name, err.message, err.stack);
      return { success: false, ...err };
    }
  };
}

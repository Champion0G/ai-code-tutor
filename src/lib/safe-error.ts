
export function safeError(err: unknown): { name: string; message: string } {
  if (err instanceof Error) {
    return { name: err.name, message: err.message };
  }

  if (typeof err === "string") {
    return { name: "StringError", message: err };
  }

  if (typeof err === "object" && err !== null) {
    const anyErr = err as any;
    return {
      name: anyErr.name || "ObjectError",
      message: anyErr.message || JSON.stringify(err),
    };
  }

  return { name: "UnknownError", message: "An unknown error occurred" };
}

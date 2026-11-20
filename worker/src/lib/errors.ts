import type { ZodError } from "zod";

/** Mirrors FastAPI's HTTPException: serialised as `{"detail": ...}`. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: unknown,
  ) {
    super(typeof detail === "string" ? detail : "API error");
  }
}

/** FastAPI-style 422 body: `{"detail":[{"loc":[...],"msg":"...","type":"..."}]}`. */
export function validationError(err: ZodError, where: "body" | "query" | "path"): ApiError {
  return new ApiError(
    422,
    err.issues.map((i) => ({
      loc: [where, ...i.path.map(String)],
      msg: i.message,
      type: i.code,
    })),
  );
}

/** SQLite/D1 unique-constraint violation, unwrapping Drizzle's error wrapper. */
export function isUniqueViolation(e: unknown): boolean {
  for (let err = e as { message?: string; cause?: unknown } | undefined, i = 0; err && i < 5; i++) {
    if (typeof err.message === "string" && err.message.includes("UNIQUE constraint failed")) return true;
    err = err.cause as typeof err;
  }
  return false;
}

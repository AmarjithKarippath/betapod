import type { Context } from "hono";
import type { z } from "zod";
import { ApiError, validationError } from "./errors";

export async function parseJson<T extends z.ZodType>(c: Context, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    throw new ApiError(422, [{ loc: ["body"], msg: "Invalid JSON body", type: "json_invalid" }]);
  }
  const r = schema.safeParse(raw);
  if (!r.success) throw validationError(r.error, "body");
  return r.data;
}

export function parseQuery<T extends z.ZodType>(c: Context, schema: T): z.infer<T> {
  const r = schema.safeParse(c.req.query());
  if (!r.success) throw validationError(r.error, "query");
  return r.data;
}

export function parseId(c: Context, name = "request_id"): number {
  const raw = c.req.param(name) ?? "";
  if (!/^-?\d+$/.test(raw)) {
    throw new ApiError(422, [
      { loc: ["path", name], msg: "Input should be a valid integer", type: "int_parsing" },
    ]);
  }
  return Number(raw);
}

// Port of api/app/core/uploads.py: validate, re-encode (strips metadata,
// caps dimensions) and store in R2. Returns the public path, which keeps the
// old `/uploads/<file>` shape so existing screenshot_path values still work.
import type { Env } from "../env";
import { ApiError } from "./errors";

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 2048;

const FORMATS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
} as const;
type Format = keyof typeof FORMATS;

function sniff(b: Uint8Array): Format | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  const ascii = (s: number, e: number) => String.fromCharCode(...b.subarray(s, e));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  return null;
}

const toStream = (bytes: Uint8Array) => new Blob([bytes]).stream();

function randomName(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function saveScreenshot(env: Env, file: File): Promise<string> {
  if (file.size > UPLOAD_MAX_BYTES) {
    throw new ApiError(413, `File exceeds ${UPLOAD_MAX_BYTES / 1024 / 1024}MB limit`);
  }
  const raw = new Uint8Array(await file.arrayBuffer());
  const format = sniff(raw);
  if (!format) throw new ApiError(400, "Image must be JPEG, PNG, or WEBP");

  let out: ReadableStream<Uint8Array>;
  try {
    const info = await env.IMAGES.info(toStream(raw));
    if (info.format !== format) throw new Error(`format mismatch: ${info.format}`);
    const result = await env.IMAGES.input(toStream(raw))
      .transform({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "scale-down" })
      .output({ format });
    out = result.image();
  } catch (e) {
    console.warn("image rejected", e);
    throw new ApiError(400, "Invalid image file");
  }

  const filename = `${randomName()}${FORMATS[format]}`;
  const body = new Uint8Array(await new Response(out).arrayBuffer());
  try {
    await env.UPLOADS.put(filename, body, { httpMetadata: { contentType: format } });
  } catch (e) {
    console.error("R2 put failed", e);
    throw new ApiError(500, "Failed to store screenshot");
  }
  return `/uploads/${filename}`;
}

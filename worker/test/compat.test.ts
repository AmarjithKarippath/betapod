// Proves the Worker accepts credentials minted by the old Python API
// (fixtures generated with argon2-cffi 23.1.0 and PyJWT 2.10.1).
import { describe, expect, it } from "vitest";
import { decodeAccessToken, hashPassword, verifyPassword } from "../src/lib/security";
import fx from "./python-compat.json";

describe("python compatibility", () => {
  it("verifies argon2-cffi password hashes", async () => {
    expect(await verifyPassword(fx.password, fx.argon2_hash)).toBe(true);
    expect(await verifyPassword("wrong-password", fx.argon2_hash)).toBe(false);
  });

  it("produces hashes in the same PHC format", async () => {
    const h = await hashPassword("pw123456");
    expect(h).toMatch(/^\$argon2id\$v=19\$m=65536,t=3,p=4\$/);
    expect(await verifyPassword("pw123456", h)).toBe(true);
  });

  it("accepts PyJWT session tokens", async () => {
    expect(await decodeAccessToken(fx.jwt, fx.jwt_secret)).toBe(fx.jwt_user_id);
    expect(await decodeAccessToken(fx.jwt, "other-secret")).toBeNull();
  });

  it("verifies garbage hashes as false instead of throwing", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
  });
});

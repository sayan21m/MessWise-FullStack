import { describe, test, expect } from "@jest/globals";
import { hashPassword, verifyPassword } from "../src/utils/password.js";

describe("Password Utility Tests", () => {
  const password = "messWise@123";

  test("should generate a password hash", async () => {
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test("should same with actual password", async () => {
    const hash = await hashPassword(password);
    const isSame = await verifyPassword(password, hash);

    expect(isSame).toBe(true);
  });
});

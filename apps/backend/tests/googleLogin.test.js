import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockVerifyIdToken = jest.fn();

jest.unstable_mockModule("google-auth-library", () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { default: prisma } = await import("../src/config/db.js");

describe("Google Login API Tests", () => {
  const uniqueMail = `google_${Date.now()}@messwise.test`;
  const googleId = `google-sub-${Date.now()}`;
  const idToken = "fake-google-id-token";

  function mockGooglePayload(overrides = {}) {
    mockVerifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: googleId,
        email: uniqueMail,
        email_verified: true,
        given_name: "Sayan",
        family_name: "Garai",
        ...overrides,
      }),
    });
  }

  beforeEach(() => {
    mockVerifyIdToken.mockReset();
  });

  test("should not login with invalid data", async () => {
    const response = await request(app).post("/api/v1/google-login").send({
      id_token: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not login with invalid Google ID token", async () => {
    mockVerifyIdToken.mockRejectedValue(new Error("Wrong number of segments"));

    const response = await request(app).post("/api/v1/google-login").send({
      id_token: "invalid-google-token",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid Google ID token");
  });

  test("should not login when Google email is not verified", async () => {
    mockGooglePayload({ email_verified: false });

    const response = await request(app).post("/api/v1/google-login").send({
      id_token: idToken,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Google email is not verified");
  });

  test("should create user and login with valid Google ID token", async () => {
    mockGooglePayload();

    const response = await request(app).post("/api/v1/google-login").send({
      id_token: idToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Logged in successfully");
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.mail).toBe(uniqueMail);
    expect(response.body.user.first_name).toBe("Sayan");
    expect(response.body.user.last_name).toBe("Garai");
    expect(response.body.user.password_hash).toBeUndefined();

    const user = await prisma.user.findUnique({
      where: { mail: uniqueMail },
    });

    expect(user).toBeDefined();
    expect(user.google_id).toBe(googleId);
    expect(user.email_verified).toBe(true);
    expect(user.password_hash).toBeNull();
  });

  test("should login existing Google user", async () => {
    mockGooglePayload();

    const response = await request(app).post("/api/v1/google-login").send({
      id_token: idToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user.mail).toBe(uniqueMail);
  });

  test("should not login when email already exists without Google account", async () => {
    const conflictMail = `conflict_${Date.now()}@messwise.test`;

    await prisma.user.create({
      data: {
        first_name: "Existing",
        last_name: "User",
        mail: conflictMail,
        password_hash: "hashed-password",
        email_verified: true,
      },
    });

    mockGooglePayload({
      sub: `google-sub-conflict-${Date.now()}`,
      email: conflictMail,
    });

    const response = await request(app).post("/api/v1/google-login").send({
      id_token: idToken,
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe(
      "An account already exists with this email. Please login using your password."
    );
  });
});

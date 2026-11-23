import { describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../src/services/email.service.js", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue("mock-verification-id"),
  sendMessInvitationEmail: jest.fn().mockResolvedValue("mock-invitation-id"),
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { default: prisma } = await import("../src/config/db.js");
const { generateVerificationToken } = await import("../src/services/user.service.js");

describe("User Creation and Login API Tests", () => {
  const password = "messWise@123";
  const uniqueMail = `user_${Date.now()}@messwise.test`;

  let verificationToken;

  const registerPayload = {
    first_name: "Sayan",
    last_name: "Garai",
    mail: uniqueMail,
    password,
  };

  test("should register a new user", async () => {
    const response = await request(app).post("/api/v1/register").send(registerPayload);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.user).toBeDefined();
    expect(response.body.user.mail).toBe(uniqueMail);
    expect(response.body.user.first_name).toBe("Sayan");
    expect(response.body.user.last_name).toBe("Garai");
    expect(response.body.user.password_hash).toBeUndefined();
  });

  test("should not register with duplicate email", async () => {
    const response = await request(app).post("/api/v1/register").send(registerPayload);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("User already exists");
  });

  test("should not register with invalid data", async () => {
    const response = await request(app).post("/api/v1/register").send({
      first_name: "S",
      last_name: "",
      mail: "invalid-email",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not login before email verification", async () => {
    const response = await request(app).post("/api/v1/login").send({
      mail: uniqueMail,
      password,
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Please verify your email before logging in");
  });

  test("should not verify email with invalid data", async () => {
    const response = await request(app).post("/api/v1/verify-email").send({
      token: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not verify email with invalid token", async () => {
    const response = await request(app).post("/api/v1/verify-email").send({
      token: "invalid-verification-token",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid token");
  });

  test("should verify email with valid token", async () => {
    const { token, token_hash } = generateVerificationToken();
    verificationToken = token;

    const user = await prisma.user.findUnique({
      where: { mail: uniqueMail },
    });

    await prisma.emailVerification.updateMany({
      where: {
        user_id: user.user_id,
        used_at: null,
      },
      data: {
        token_hash,
        expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    });

    const response = await request(app).post("/api/v1/verify-email").send({
      token: verificationToken,
    });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.mail).toBe(uniqueMail);
    expect(response.body.user.email_verified).toBe(true);
  });

  test("should not reuse verification token", async () => {
    const response = await request(app).post("/api/v1/verify-email").send({
      token: verificationToken,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Token has already been used");
  });

  test("should login with correct credentials after verification", async () => {
    const response = await request(app).post("/api/v1/login").send({
      mail: uniqueMail,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Logged in successfully");
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.user).toBeDefined();
    expect(response.body.user.mail).toBe(uniqueMail);
    expect(response.body.user.password_hash).toBeUndefined();
  });

  test("should not login with wrong password", async () => {
    const response = await request(app).post("/api/v1/login").send({
      mail: uniqueMail,
      password: "wrongPassword@123",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  test("should not login with invalid data", async () => {
    const response = await request(app).post("/api/v1/login").send({
      mail: "invalid-email",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });
});

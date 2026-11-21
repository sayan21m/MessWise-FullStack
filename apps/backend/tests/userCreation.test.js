import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";

describe("User Creation and Login API Tests", () => {
  const password = "messWise@123";
  const uniqueMail = `sayan@messwise.test`;

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

  test("should login with correct credentials", async () => {
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

import { describe, test, expect } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/config/db.js";

describe("Mess API Tests", () => {
  const mail = "sayan@messwise.test";
  const password = "messWise@123";
  const messName = "Chatra Niwas";
  const inviteMail = `invite_${Date.now()}@messwise.test`;

  let accessToken;
  let inviteeToken;
  let messId;

  test("should login with correct credentials", async () => {
    await prisma.user.updateMany({
      where: { mail },
      data: { email_verified: true },
    });

    const loginResponse = await request(app).post("/api/v1/login").send({
      mail,
      password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toBeDefined();
    expect(loginResponse.body.accessToken).toBeDefined();

    accessToken = loginResponse.body.accessToken;

    expect(Boolean(accessToken)).toBe(true);
  });

  test("should create a mess with valid token", async () => {
    const response = await request(app)
      .post("/api/v1/mess")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mess_name: messName });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Mess created successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_name).toBe(messName);
    expect(response.body.data.mess_id).toBeDefined();

    messId = response.body.data.mess_id;
  });

  test("should not create a mess without token", async () => {
    const response = await request(app).post("/api/v1/mess").send({ mess_name: messName });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not create a mess with invalid data", async () => {
    const response = await request(app)
      .post("/api/v1/mess")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mess_name: "ab" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should get all messes with valid token", async () => {
    const response = await request(app)
      .get("/api/v1/mess")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("All messes fetched successfully");
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].mess_name).toBeDefined();
    expect(response.body.data[0].mess_code).toBeDefined();
    expect(response.body.data[0].role).toBeDefined();
  });

  test("should not get messes without token", async () => {
    const response = await request(app).get("/api/v1/mess");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should get mess by id with valid token", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Mess fetched successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.mess).toBeDefined();
    expect(response.body.data.mess.mess_name).toBe(messName);
  });

  test("should not get mess by id without token", async () => {
    const response = await request(app).get(`/api/v1/mess/${messId}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not get mess by invalid id", async () => {
    const response = await request(app)
      .get("/api/v1/mess/invalid-mess-id")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Mess not found");
  });

  test("should register invitee user", async () => {
    const response = await request(app).post("/api/v1/register").send({
      first_name: "Invite",
      last_name: "User",
      mail: inviteMail,
      password,
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.mail).toBe(inviteMail);
  });

  test("should send invitation with valid token", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: inviteMail });

    expect(response.status).toBe(201);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Invitation created successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_id).toBe(messId);
  });

  test("should not send invitation without token", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .send({ invited_email: inviteMail });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not send invitation with invalid email", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: "invalid-email" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not invite yourself", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: mail });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("You cannot invite yourself");
  });

  test("should not send duplicate invitation", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: inviteMail });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("An invitation is already pending");
  });

  test("should login invitee user", async () => {
    await prisma.user.updateMany({
      where: { mail: inviteMail },
      data: { email_verified: true },
    });

    const response = await request(app).post("/api/v1/login").send({
      mail: inviteMail,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();

    inviteeToken = response.body.accessToken;
  });

  test("should get pending invitations with valid token", async () => {
    const response = await request(app)
      .get("/api/v1/mess/invitations")
      .set("Authorization", `Bearer ${inviteeToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body.message).toBe("Invitations fetched successfully");
    expect(response.body.data).toBeDefined();
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].mess_id).toBe(messId);
    expect(response.body.data[0].status).toBe("PENDING");
    expect(response.body.data[0].mess).toBeDefined();
  });

  test("should not get pending invitations without token", async () => {
    const response = await request(app).get("/api/v1/mess/invitations");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });
});

import { beforeAll, describe, expect, jest, test } from "@jest/globals";
import crypto from "node:crypto";

const invitationTokensByEmail = new Map();

jest.unstable_mockModule("../src/services/email.service.js", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue("mock-verification-id"),
  sendMessInvitationEmail: jest.fn().mockImplementation(async (email, token) => {
    invitationTokensByEmail.set(email, token);
    return "mock-invitation-id";
  }),
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { default: prisma } = await import("../src/config/db.js");

describe("Mess API Tests", () => {
  const password = "messWise@123";
  const stamp = Date.now();
  const adminMail = `mess_admin_${stamp}@messwise.test`;
  const inviteMail = `mess_invite_${stamp}@messwise.test`;
  const externalMail = `mess_external_${stamp}@messwise.test`;
  const messName = `Chatra Niwas ${stamp}`;

  let accessToken;
  let inviteeToken;
  let externalToken;
  let messId;
  let inviteeInvitationToken;
  let externalInvitationToken;

  async function registerAndVerify(mail, first_name = "Mess", last_name = "Admin") {
    const response = await request(app).post("/api/v1/register").send({
      first_name,
      last_name,
      mail,
      password,
    });

    expect(response.status).toBe(201);

    await prisma.user.updateMany({
      where: { mail },
      data: { email_verified: true },
    });
  }

  async function login(mail) {
    const response = await request(app).post("/api/v1/login").send({
      mail,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();

    return response.body.accessToken;
  }

  beforeAll(async () => {
    await registerAndVerify(adminMail, "Mess", "Admin");
    accessToken = await login(adminMail);
  });

  test("should create a mess with valid token", async () => {
    const response = await request(app)
      .post("/api/v1/mess")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mess_name: messName });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Mess created successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_name).toBe(messName);
    expect(response.body.data.mess_id).toBeDefined();
    expect(response.body.data.mess_code).toBeDefined();

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
    expect(response.body.message).toBe("All messes fetched successfully");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data.some((mess) => mess.mess_name === messName)).toBe(true);
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
    expect(response.body.message).toBe("Mess fetched successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.mess).toBeDefined();
    expect(response.body.data.mess.mess_name).toBe(messName);
    expect(response.body.data.role).toBe("ADMIN");
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
    await registerAndVerify(inviteMail, "Invite", "User");
  });

  test("should send invitation with valid token", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: inviteMail });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Invitation created successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.status).toBe("PENDING");
    expect(response.body.data.invitation_send).toBe(true);

    inviteeInvitationToken = invitationTokensByEmail.get(inviteMail);
    expect(inviteeInvitationToken).toBeDefined();
  });

  test("should send invitation to unregistered email", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: externalMail });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Invitation created successfully");
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.invited_email).toBe(externalMail);
    expect(response.body.data.invited_user_id).toBeNull();

    externalInvitationToken = invitationTokensByEmail.get(externalMail);
    expect(externalInvitationToken).toBeDefined();
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
      .send({ invited_email: adminMail });

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

  test("should not send invitation for missing mess", async () => {
    const response = await request(app)
      .post("/api/v1/mess/missing-mess-id/invitations")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: inviteMail });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Mess not found");
  });

  test("should login invitee user", async () => {
    inviteeToken = await login(inviteMail);
  });

  test("should get pending invitations with valid token", async () => {
    const response = await request(app)
      .get("/api/v1/mess/invitations")
      .set("Authorization", `Bearer ${inviteeToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Invitations fetched successfully");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].mess_id).toBe(messId);
    expect(response.body.data[0].status).toBe("PENDING");
    expect(response.body.data[0].mess).toBeDefined();
    expect(response.body.data[0].invited_by).toBeDefined();
  });

  test("should not get pending invitations without token", async () => {
    const response = await request(app).get("/api/v1/mess/invitations");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not allow invitee to get mess they are not a member of", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}`)
      .set("Authorization", `Bearer ${inviteeToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Mess not found");
  });

  test("should not allow non-member to send invitation", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${inviteeToken}`)
      .send({ invited_email: `another_${stamp}@messwise.test` });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should not accept invitation without token", async () => {
    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .send({ token: inviteeInvitationToken });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not accept invitation with invalid data", async () => {
    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .set("Authorization", `Bearer ${inviteeToken}`)
      .send({ token: "" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not accept invitation with invalid invitation token", async () => {
    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .set("Authorization", `Bearer ${inviteeToken}`)
      .send({ token: crypto.randomBytes(32).toString("hex") });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Invalid invitation token");
  });

  test("should not accept another user's invitation", async () => {
    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ token: inviteeInvitationToken });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("This invitation belongs to another user");
  });

  test("should accept invitation with valid token", async () => {
    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .set("Authorization", `Bearer ${inviteeToken}`)
      .send({ token: inviteeInvitationToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Invitation accepted successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.role).toBe("MEMBER");
  });

  test("should not reuse accepted invitation token", async () => {
    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .set("Authorization", `Bearer ${inviteeToken}`)
      .send({ token: inviteeInvitationToken });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invitation is no longer pending");
  });

  test("should allow invitee to get mess after accepting invitation", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}`)
      .set("Authorization", `Bearer ${inviteeToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.role).toBe("MEMBER");
  });

  test("should register external invitee and accept email invitation", async () => {
    await registerAndVerify(externalMail, "External", "User");
    externalToken = await login(externalMail);

    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .set("Authorization", `Bearer ${externalToken}`)
      .send({ token: externalInvitationToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Invitation accepted successfully");
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.role).toBe("MEMBER");
  });

  test("should not accept expired invitation", async () => {
    const expiredMail = `mess_expired_${stamp}@messwise.test`;
    await registerAndVerify(expiredMail, "Expired", "User");
    const expiredUserToken = await login(expiredMail);

    const inviteResponse = await request(app)
      .post(`/api/v1/mess/${messId}/invitations`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ invited_email: expiredMail });

    expect(inviteResponse.status).toBe(201);

    const expiredInvitationToken = invitationTokensByEmail.get(expiredMail);
    expect(expiredInvitationToken).toBeDefined();

    const token_hash = crypto
      .createHash("sha256")
      .update(expiredInvitationToken)
      .digest("hex");

    await prisma.messInvitation.update({
      where: { token_hash },
      data: { expires_at: new Date(Date.now() - 60 * 1000) },
    });

    const response = await request(app)
      .post("/api/v1/mess/accept-invitation")
      .set("Authorization", `Bearer ${expiredUserToken}`)
      .send({ token: expiredInvitationToken });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invitation has expired");
  });
});


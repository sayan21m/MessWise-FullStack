import { beforeAll, describe, expect, jest, test } from "@jest/globals";

jest.unstable_mockModule("../src/services/email.service.js", () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue("mock-verification-id"),
  sendMessInvitationEmail: jest.fn().mockResolvedValue("mock-invitation-id"),
}));

const { default: request } = await import("supertest");
const { default: app } = await import("../src/app.js");
const { default: prisma } = await import("../src/config/db.js");

describe("Transaction API Tests", () => {
  const password = "messWise@123";
  const stamp = Date.now();
  const adminMail = `txn_admin_${stamp}@messwise.test`;
  const outsiderMail = `txn_outsider_${stamp}@messwise.test`;
  const memberMail = `txn_member_${stamp}@messwise.test`;
  const messName = `Txn Mess ${stamp}`;

  let accessToken;
  let outsiderToken;
  let memberToken;
  let messId;
  let cashInId;
  let cashOutId;
  let deleteTargetId;

  async function registerAndVerify(mail, first_name, last_name) {
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
    await registerAndVerify(adminMail, "Txn", "Admin");
    accessToken = await login(adminMail);

    const messResponse = await request(app)
      .post("/api/v1/mess")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ mess_name: messName });

    expect(messResponse.status).toBe(201);
    messId = messResponse.body.data.mess_id;

    await registerAndVerify(outsiderMail, "Txn", "Outsider");
    outsiderToken = await login(outsiderMail);

    await registerAndVerify(memberMail, "Txn", "Member");
    memberToken = await login(memberMail);

    const member = await prisma.user.findUnique({ where: { mail: memberMail } });
    await prisma.messMembership.create({
      data: {
        user_id: member.user_id,
        mess_id: messId,
        role: "MEMBER",
      },
    });
  });

  test("should record cash-in with valid data", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        category: "Member Deposit",
        amount: 500.5,
        description: "Monthly contribution",
        transaction_date: "2026-11-23T10:00:00.000Z",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Cash in transaction recorded successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.transaction_type).toBe("CASH_IN");
    expect(response.body.data.category).toBe("Member Deposit");
    expect(Number(response.body.data.amount)).toBe(500.5);
    expect(response.body.data.description).toBe("Monthly contribution");
    expect(response.body.data.transaction_id).toBeDefined();

    cashInId = response.body.data.transaction_id;
  });

  test("should record cash-in with only amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 100 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.transaction_type).toBe("CASH_IN");
    expect(Number(response.body.data.amount)).toBe(100);
    expect(response.body.data.category).toBe("Others");
  });

  test("should not record cash-in without token", async () => {
    const response = await request(app).post(`/api/v1/mess/${messId}/cashin`).send({ amount: 100 });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not record cash-in with invalid amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-in with negative amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: -50 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-in with missing amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ category: "Deposit" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-in with invalid transaction date", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        amount: 100,
        transaction_date: "23-11-2026",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-in when user is not a mess member", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ amount: 100 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should not record cash-in for missing mess", async () => {
    const response = await request(app)
      .post("/api/v1/mess/missing-mess-id/cashin")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 100 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should record cash-out with valid data", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        category: "Groceries",
        amount: 250.75,
        description: "Weekly market run",
        transaction_date: "2026-11-23T12:00:00.000Z",
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Cash out transaction recorded successfully");
    expect(response.body.data).toBeDefined();
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.transaction_type).toBe("CASH_OUT");
    expect(response.body.data.category).toBe("Groceries");
    expect(Number(response.body.data.amount)).toBe(250.75);
    expect(response.body.data.description).toBe("Weekly market run");
    expect(response.body.data.transaction_id).toBeDefined();

    cashOutId = response.body.data.transaction_id;
  });

  test("should record cash-out with only amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 80 });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.transaction_type).toBe("CASH_OUT");
    expect(Number(response.body.data.amount)).toBe(80);
    expect(response.body.data.category).toBe("Others");
  });

  test("should not record cash-out without token", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .send({ amount: 100 });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not record cash-out with invalid amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-out with negative amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: -25 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-out with missing amount", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ category: "Utilities" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-out with invalid transaction date", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        amount: 100,
        transaction_date: "23-11-2026",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not record cash-out when user is not a mess member", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashout`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ amount: 100 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should not record cash-out for missing mess", async () => {
    const response = await request(app)
      .post("/api/v1/mess/missing-mess-id/cashout")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 100 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should get all transactions with valid token", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/all-transactions`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Transactions fetched successfully");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(4);
    expect(response.body.data.some((txn) => txn.transaction_id === cashInId)).toBe(true);
    expect(response.body.data.some((txn) => txn.transaction_id === cashOutId)).toBe(true);
  });

  test("should not get all transactions without token", async () => {
    const response = await request(app).get(`/api/v1/mess/${messId}/all-transactions`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not get all transactions when user is not a mess member", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/all-transactions`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should get total mess balance with valid token", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/total-balance`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Mess balance fetched successfully");
    expect(Number(response.body.data)).toBe(269.75);
  });

  test("should not get total mess balance without token", async () => {
    const response = await request(app).get(`/api/v1/mess/${messId}/total-balance`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not get total mess balance when user is not a mess member", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/total-balance`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should get transaction by id with valid token", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/${cashInId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Transaction fetched successfully");
    expect(response.body.data.transaction_id).toBe(cashInId);
    expect(response.body.data.mess_id).toBe(messId);
    expect(response.body.data.transaction_type).toBe("CASH_IN");
  });

  test("should not get transaction by id without token", async () => {
    const response = await request(app).get(`/api/v1/mess/${messId}/${cashInId}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not get transaction by id with invalid tid", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/abc`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not get missing transaction by id", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/999999999`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Transaction record not found");
  });

  test("should not get transaction by id when user is not a mess member", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/${cashInId}`)
      .set("Authorization", `Bearer ${outsiderToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should update transaction with valid data", async () => {
    const response = await request(app)
      .patch(`/api/v1/mess/${messId}/${cashInId}/update-transaction`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        category: "Updated Deposit",
        amount: 600,
        description: "Updated contribution",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Transaction updated successfully");
    expect(response.body.data.transaction_id).toBe(cashInId);
    expect(response.body.data.category).toBe("Updated Deposit");
    expect(Number(response.body.data.amount)).toBe(600);
    expect(response.body.data.description).toBe("Updated contribution");
  });

  test("should not update transaction without token", async () => {
    const response = await request(app)
      .patch(`/api/v1/mess/${messId}/${cashInId}/update-transaction`)
      .send({ amount: 700 });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not update transaction with empty body", async () => {
    const response = await request(app)
      .patch(`/api/v1/mess/${messId}/${cashInId}/update-transaction`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not update transaction with invalid amount", async () => {
    const response = await request(app)
      .patch(`/api/v1/mess/${messId}/${cashInId}/update-transaction`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: -10 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  test("should not update missing transaction", async () => {
    const response = await request(app)
      .patch(`/api/v1/mess/${messId}/999999999/update-transaction`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 50 });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Transaction record not found");
  });

  test("should not update transaction when user is not a mess member", async () => {
    const response = await request(app)
      .patch(`/api/v1/mess/${messId}/${cashInId}/update-transaction`)
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({ amount: 50 });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You are not a member of this mess");
  });

  test("should create cash-in for delete target", async () => {
    const response = await request(app)
      .post(`/api/v1/mess/${messId}/cashin`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ amount: 40, category: "Delete Me" });

    expect(response.status).toBe(201);
    deleteTargetId = response.body.data.transaction_id;
  });

  test("should not allow non-admin member to delete transaction", async () => {
    const response = await request(app)
      .delete(`/api/v1/mess/${messId}/${deleteTargetId}`)
      .set("Authorization", `Bearer ${memberToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Only mess admins can delete transactions");
  });

  test("should not delete transaction without token", async () => {
    const response = await request(app).delete(`/api/v1/mess/${messId}/${deleteTargetId}`);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Authentication required");
  });

  test("should not delete missing transaction", async () => {
    const response = await request(app)
      .delete(`/api/v1/mess/${messId}/999999999`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Transaction record not found");
  });

  test("should delete transaction as admin", async () => {
    const response = await request(app)
      .delete(`/api/v1/mess/${messId}/${deleteTargetId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Transaction deleted successfully");
    expect(response.body.data.transaction_id).toBe(deleteTargetId);
  });

  test("should not get deleted transaction", async () => {
    const response = await request(app)
      .get(`/api/v1/mess/${messId}/${deleteTargetId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Transaction record not found");
  });
});

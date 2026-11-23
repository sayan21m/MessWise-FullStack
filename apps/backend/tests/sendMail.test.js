import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockSendMail = jest.fn();
const mockVerify = jest.fn();

jest.unstable_mockModule("../src/config/mailer.js", () => ({
  default: {
    sendMail: mockSendMail,
    verify: mockVerify,
  },
}));

const { sendVerificationEmail } = await import("../src/services/email.service.js");

describe("Send Mail Tests", () => {
  const userEmail = "user@messwise.test";
  const token = "verification-token-123";

  beforeEach(() => {
    mockSendMail.mockReset();
    mockVerify.mockReset();
    process.env.FRONTEND_URL = "http://localhost:5173";
    process.env.MAIL_FROM = "noreply@messwise.test";
  });

  test("should send verification email successfully", async () => {
    mockSendMail.mockResolvedValue({ messageId: "test-message-id" });

    const messageId = await sendVerificationEmail(userEmail, token);

    expect(messageId).toBe("test-message-id");
    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.to).toBe(userEmail);
    expect(mailOptions.from).toContain("noreply@messwise.test");
    expect(mailOptions.subject).toBe("Verify your MessWise account");
    expect(mailOptions.html).toContain(
      "http://localhost:5173/verify-email?token=verification-token-123"
    );
  });

  test("should throw when email sending fails", async () => {
    mockSendMail.mockRejectedValue(new Error("SMTP send failed"));

    await expect(sendVerificationEmail(userEmail, token)).rejects.toThrow(
      "SMTP send failed"
    );
  });
});

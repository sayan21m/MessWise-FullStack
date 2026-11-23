import { beforeEach, describe, expect, jest, test } from "@jest/globals";

const mockVerify = jest.fn();
const mockSendMail = jest.fn();

jest.unstable_mockModule("../src/config/mailer.js", () => ({
  default: {
    verify: mockVerify,
    sendMail: mockSendMail,
  },
}));

const { default: transporter } = await import("../src/config/mailer.js");

describe("Mailer Connection Tests", () => {
  beforeEach(() => {
    mockVerify.mockReset();
    mockSendMail.mockReset();
  });

  test("should verify SMTP connection successfully", async () => {
    mockVerify.mockResolvedValue(true);

    await expect(transporter.verify()).resolves.toBe(true);
    expect(mockVerify).toHaveBeenCalledTimes(1);
  });

  test("should fail when SMTP connection is invalid", async () => {
    mockVerify.mockRejectedValue(new Error("Invalid login"));

    await expect(transporter.verify()).rejects.toThrow("Invalid login");
  });
});

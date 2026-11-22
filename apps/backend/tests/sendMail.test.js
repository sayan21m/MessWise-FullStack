import "dotenv/config";
import transporter from "../src/config/mailer.js";

try {
  const info = await transporter.sendMail({
    from: `MessWise <${process.env.MAIL_FROM}>`,
    to: `sayangarai04@gmail.com`,
    subject: "MessWise Email Test",
    text: "Your Mailjet SMTP integration is working!",
    html: `
      <h2>Welcome to MessWise!</h2>
      <p>Your email delivery integration is working successfully.</p>
    `,
  });

  console.log("Email sent successfully!");
  console.log("Message ID:", info.messageId);
} catch (error) {
  console.error("Email sending failed:", error);
}

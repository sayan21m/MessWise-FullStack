import "dotenv/config";
import transporter from "../src/config/mailer.js";

try {
  await transporter.verify();
  console.log("Mailjet SMTP connection successful!");
} catch (error) {
  console.error("SMTP connection failed:", error.message);
}

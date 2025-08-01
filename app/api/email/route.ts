import { NextRequest, NextResponse } from "next/server";
import formData from "form-data";
import Mailgun from "mailgun.js";

const API_KEY = process.env.MAILGUN_API_KEY || "";
const DOMAIN = process.env.MAILGUN_DOMAIN || "";

export async function POST(req: NextRequest) {
  const { recipients, subject, body, isTest, testRecipient } = await req.json();

  const mailgun = new Mailgun(formData);
  const client = mailgun.client({ username: "api", key: API_KEY });

  if (isTest) {
    // Send a single test email
    if (!testRecipient) {
      return NextResponse.json(
        { message: "Test recipient email is required" },
        { status: 400 }
      );
    }
    const messageData = {
      from: `Dell'Arte International <noreply@${DOMAIN}>`,
      to: testRecipient,
      subject: `[TEST] ${subject}`,
      text: body,
      html: body.replace(/\\n/g, "<br>"),
    };

    try {
      await client.messages.create(DOMAIN, messageData);
      return NextResponse.json({ message: "Test email sent successfully" });
    } catch (error) {
      console.error("Error sending test email:", error);
      return NextResponse.json(
        { message: "Error sending test email" },
        { status: 500 }
      );
    }
  } else {
    // Send bulk email
    if (!recipients || recipients.length === 0) {
      return NextResponse.json(
        { message: "Recipient list is empty" },
        { status: 400 }
      );
    }

    const recipientVariables: { [key: string]: any } = {};
    recipients.forEach(
      (recipient: { email: string; firstName: string; lastName: string }) => {
        recipientVariables[recipient.email] = {
          firstName: recipient.firstName,
          lastName: recipient.lastName,
        };
      }
    );

    const messageData = {
      from: `Dell'Arte International <noreply@${DOMAIN}>`,
      to: recipients.map(
        (r: { email: string; firstName: string; lastName: string }) => r.email
      ),
      subject: subject,
      text: body,
      html: body.replace(/\\n/g, "<br>"),
      "recipient-variables": JSON.stringify(recipientVariables),
    };

    try {
      await client.messages.create(DOMAIN, messageData);
      return NextResponse.json({ message: "Bulk email sent successfully" });
    } catch (error) {
      console.error("Error sending bulk email:", error);
      return NextResponse.json(
        { message: "Error sending bulk email" },
        { status: 500 }
      );
    }
  }
}

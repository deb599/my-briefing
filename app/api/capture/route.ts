import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set. Add it to .env.local");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);

  try {
    const { email, query, optIn, briefingText } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const userEmail = email.trim().toLowerCase();
    const userQuery = String(query || "No specific query provided");
    const briefingSummary = briefingText
      ? `<hr style="border:none;border-top:1px solid #ddd;margin:24px 0"/>
         <h3 style="font-size:1rem;margin-bottom:12px">Your Briefing Summary</h3>
         <pre style="white-space:pre-wrap;font-family:monospace;font-size:.82rem;line-height:1.6;color:#444;background:#f8f8f8;padding:16px;border-radius:6px">${briefingText
           .replace(/&/g, "&amp;")
           .replace(/</g, "&lt;")
           .replace(/>/g, "&gt;")}</pre>`
      : "";

    const { data, error } = await resend.emails.send({
      // IMPORTANT: Replace with your verified Resend sender domain once set up.
      // onboarding@resend.dev only delivers to your own Resend account email.
      // To send to any email: verify a domain at resend.com/domains and use
      // something like: "Briefing Bot <noreply@yourdomain.com>"
      from: "Briefing Bot <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Your Intelligence Briefing: "${userQuery}"`,
      html: `
        <div style="font-family:sans-serif;line-height:1.6;color:#1c1c1e;max-width:640px;margin:0 auto">
          <h2 style="font-size:1.3rem;margin-bottom:8px">Briefing Confirmed</h2>
          <p>Here is the 7-agent intelligence briefing for your query:</p>
          <blockquote style="border-left:4px solid #ffd60a;padding:8px 16px;margin:16px 0;font-style:italic;color:#555">
            ${userQuery}
          </blockquote>
          ${briefingSummary}
          <p style="font-size:.78rem;color:#999;margin-top:32px">
            AI-generated analysis only. Verify with current sources before making decisions.
            ${optIn ? " | You opted into the AI Watcher newsletter." : ""}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", JSON.stringify(error));
      return NextResponse.json({ error: "Failed to send email", detail: error }, { status: 500 });
    }

    if (optIn) {
      console.log(`Newsletter opt-in: ${userEmail}`);
    }

    console.log("Email sent:", data?.id);
    return NextResponse.json({ success: true, id: data?.id });

  } catch (err) {
    console.error("Capture route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with your API key from .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, query, optIn } = await req.json();

    // 1. Basic Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // 2. Prepare the payload
    const userEmail = email.trim().toLowerCase();
    const userQuery = String(query || "No specific query provided");

    // 3. Send the Email via Resend
    // NOTE: Use 'onboarding@resend.dev' if you haven't verified a custom domain yet.
    const { data, error } = await resend.emails.send({
      from: "Briefing Bot <onboarding@resend.dev>", 
      to: [userEmail],
      subject: "Your Intelligence Briefing is Ready",
      html: `
        <div style="font-family: sans-serif; line-height: 1.5; color: #1c1c1e;">
          <h2>Briefing Confirmed</h2>
          <p>Thank you for reaching out. We've received your query:</p>
          <blockquote style="border-left: 4px solid #ffd60a; padding-left: 15px; font-style: italic;">
            "${userQuery}"
          </blockquote>
          <p>Our agents are processing your request now. You'll receive the full analysis shortly.</p>
          ${optIn ? `<p style="font-size: 0.8em; color: #666;">You are receiving this because you opted into our newsletter.</p>` : ''}
        </div>
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // 4. Handle Newsletter Opt-in (Optional)
    // If you've set up an Audience in Resend, you'd add the contact here.
    if (optIn) {
      console.log(`User ${userEmail} requested newsletter opt-in.`);
    }

    console.log("Lead captured and email sent:", data?.id);

    return NextResponse.json({ success: true, id: data?.id });
    
  } catch (err) {
    console.error("Capture route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

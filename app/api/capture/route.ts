import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReactElement } from "react";
import { BriefingDocument } from "@/components/BriefingDocument";

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set. Add it to .env.local");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const resend = new Resend(apiKey);

  try {
    const { email, query, optIn, fullAnalysis } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!fullAnalysis) {
      return NextResponse.json({ error: "Missing briefing content" }, { status: 400 });
    }

    const userEmail = email.trim().toLowerCase();
    const userQuery = String(query || "No specific query provided");

    // Generate the PDF
    const pdfBuffer = await renderToBuffer(
      BriefingDocument({ query: userQuery, analysis: fullAnalysis }) as ReactElement
    );

    const { data, error } = await resend.emails.send({
      // IMPORTANT: Replace with your verified Resend sender domain once set up.
      // onboarding@resend.dev only delivers to your own Resend account email.
      // To send to any email: verify a domain at resend.com/domains and use
      // something like: "Briefing Bot <noreply@yourdomain.com>"
      from: "Briefing Bot <onboarding@resend.dev>",
      to: [userEmail],
      subject: `Your Intelligence Briefing: "${userQuery}"`,
      html: `
        <div style="font-family:sans-serif;line-height:1.6;color:#1C1C1E;max-width:640px;margin:0 auto">
          <h2>Briefing Confirmed</h2>
          <p>The 7-agent analysis for <strong>"${userQuery}"</strong> is complete.</p>
          <p>Please find your full Intelligence Briefing attached as a PDF.</p>
          <hr style="border:1px solid #FFD60A" />
          <small style="color:#999">AI Automation Mum // Strategic Intelligence</small>
          ${optIn ? `<p style="font-size:.78rem;color:#999;margin-top:16px">You opted into the AI Watcher newsletter.</p>` : ""}
        </div>
      `,
      attachments: [
        {
          filename: `Briefing_${userQuery.replace(/\s+/g, "_")}.pdf`,
          content: pdfBuffer,
        },
      ],
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
    console.error("PDF/Email Error:", err);
    return NextResponse.json({ error: "Failed to generate or send PDF" }, { status: 500 });
  }
}

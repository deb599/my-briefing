import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReactElement } from "react";
import { BriefingDocument } from "@/components/BriefingDocument";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, query, fullAnalysis } = await req.json();

    if (!email || !fullAnalysis) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate the PDF Buffer using the template we created
    const pdfBuffer = await renderToBuffer(
      BriefingDocument({ query, analysis: fullAnalysis }) as ReactElement
    );

    // Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: "Briefing Bot <onboarding@resend.dev>", // Replace with your verified domain later
      to: [email],
      subject: `Your Briefing: ${query}`,
      html: `
        <div style="font-family: sans-serif; color: #1C1C1E;">
          <h2>Briefing Confirmed</h2>
          <p>The 6-agent analysis for <strong>"${query}"</strong> is complete.</p>
          <p>Please find your full Intelligence Briefing attached as a PDF.</p>
          <hr style="border: 1px solid #FFD60A;" />
          <small>AI Automation Mum // Strategic Intelligence</small>
        </div>
      `,
      attachments: [
        {
          filename: `Briefing_${query.replace(/\s+/g, "_")}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PDF/Email Error:", err);
    return NextResponse.json({ error: "Failed to generate or send PDF" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReactElement } from "react";
// You'll create this component in Step 3
import { BriefingDocument } from "@/components/BriefingDocument"; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, query, optIn } = await req.json();

    // 1. (Placeholder) Run your 7-agent logic here to get the 'fullAnalysis'
    const fullAnalysis = "This is the deep dive into law in 2028..."; 

    // 2. Generate the PDF Buffer
    const pdfBuffer = await renderToBuffer(
      BriefingDocument({ query, analysis: fullAnalysis }) as ReactElement
    );

    // 3. Send Email with Attachment
    const { data, error } = await resend.emails.send({
      from: "Briefing Bot <onboarding@resend.dev>",
      to: [email],
      subject: "Your 2028 Legal Intelligence Briefing (PDF)",
      html: `<p>Your requested analysis for <strong>"${query}"</strong> is attached as a PDF.</p>`,
      attachments: [
        {
          filename: "Intelligence_Briefing.pdf",
          content: pdfBuffer,
        },
      ],
    });

    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

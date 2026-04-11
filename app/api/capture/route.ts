import { NextResponse } from "next/server";
import { Resend } from "resend";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { BriefingDocument } from "@/components/BriefingDocument";

// Initialize Resend with your API Key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  console.log(">>> [EMAIL/PDF] Request Received");

  try {
    const body = await req.json();
    const { email, query, fullAnalysis } = body;

    // 1. Basic Validation
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }
    if (!fullAnalysis) {
      return NextResponse.json({ error: "No analysis data found" }, { status: 400 });
    }

    const userEmail = email.trim().toLowerCase();
    const userQuery = String(query || "Analysis Briefing");
    
    /**
     * 2. SANITIZE DATA (The "e.split" Fix)
     * This deeply traverses the analysis object and replaces any null/undefined
     * with the string "N/A". @react-pdf/renderer crashes if it receives 
     * non-string values in <Text> components.
     */
    const sanitizedAnalysis = JSON.parse(JSON.stringify(fullAnalysis), (key, value) => {
      return (value === null || value === undefined) ? "N/A" : value;
    });

    console.log(">>> [EMAIL/PDF] Generating PDF Buffer...");

    // 3. Generate PDF Buffer
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderToBuffer(
        React.createElement(BriefingDocument, {
          query: userQuery,
          analysis: sanitizedAnalysis,
        })
      );
    } catch (pdfErr: any) {
      console.error(">>> [PDF GEN ERROR]:", pdfErr.message);
      return NextResponse.json({ 
        error: "PDF generation failed", 
        detail: pdfErr.message 
      }, { status: 500 });
    }

    console.log(`>>> [EMAIL/PDF] PDF Generated (${pdfBuffer.length} bytes). Sending email...`);

    /**
     * 4. SEND VIA RESEND
     * NOTE: Use "onboarding@resend.dev" as the sender until you verify 
     * your domain (e.g., ba-co-pilot.com) in the Resend Dashboard.
     */
    const { data, error } = await resend.emails.send({
      from: "Briefing Bot <onboarding@resend.dev>", 
      to: [userEmail],
      subject: `Strategic Briefing: ${userQuery}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1C1C1E; line-height: 1.5;">
          <h2 style="color: #1C1C1E; border-bottom: 2px solid #FFD60A; padding-bottom: 8px; display: inline-block;">
            Briefing Complete
          </h2>
          <p>The strategic analysis for <strong>"${userQuery}"</strong> is now ready for review.</p>
          <p>Your full 6-agent executive briefing is attached as a PDF.</p>
          <br />
          <hr style="border: none; border-top: 1px solid #EEE;" />
          <p style="font-size: 11px; color: #999; margin-top: 20px;">
            AI Automation Mum // Decision Intelligence Systems 2026
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `Briefing_${userQuery.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.pdf`,
          content: pdfBuffer.toString("base64"), // Transfer as Base64 for stability
        },
      ],
    });

    if (error) {
      console.error(">>> [RESEND ERROR]:", error);
      return NextResponse.json({ error: "Email delivery failed", detail: error }, { status: 500 });
    }

    console.log(">>> [EMAIL/PDF] Success! ID:", data?.id);
    return NextResponse.json({ success: true, id: data?.id });

  } catch (err: any) {
    console.error(">>> [GLOBAL ERROR]:", err.message);
    return NextResponse.json({ error: "Internal Server Error", detail: err.message }, { status: 500 });
  }
}

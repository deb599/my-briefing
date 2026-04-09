import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const LEADS_FILE = path.join(process.cwd(), "leads.json");

interface Lead {
  email: string;
  query: string;
  optIn: boolean;
  capturedAt: string;
}

async function readLeads(): Promise<Lead[]> {
  try {
    const data = await fs.readFile(LEADS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeLeads(leads: Lead[]) {
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

export async function POST(req: Request) {
  try {
    const { email, query, optIn } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const lead: Lead = {
      email: email.trim().toLowerCase(),
      query: String(query || ""),
      optIn: Boolean(optIn),
      capturedAt: new Date().toISOString(),
    };

    // Store lead locally (replace with your email service: Resend, SendGrid, Mailchimp, etc.)
    const leads = await readLeads();
    leads.push(lead);
    await writeLeads(leads);

    // TODO: Connect your email service here
    // Example with Resend:
    //   await resend.emails.send({ from: '...', to: email, subject: 'Your Career Briefing', html: '...' });
    // Example with Mailchimp:
    //   if (optIn) await mailchimp.lists.addListMember(LIST_ID, { email_address: email, status: 'subscribed' });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

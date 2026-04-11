import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Initialize with the latest SDK requirements
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;
  const entry = ipHits.get(ip);
  if (!entry || now > entry.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + DAY_MS });
    return true;
  }
  if (entry.count >= 50) return false; 
  entry.count++;
  return true;
}

function buildPrompt(agentId: number, query: string, previousOutputs: string[]): string {
  const context = previousOutputs.length
    ? `\nContext from previous steps:\n${previousOutputs.join("\n\n")}\n`
    : "";

  const prompts: Record<number, string> = {
    1: `Step 1: Sentiment Analysis. What is the market mood for: "${query}"?`,
    2: `Step 2: Strategic Impact. Business implications for: "${query}"? ${context}`,
    3: `Step 3: Risk Audit. Main risks for: "${query}"? ${context}`,
    4: `Step 4: Opportunity Scout. Growth areas for: "${query}"? ${context}`,
    5: `Step 5: Technical Stack. Tools needed for: "${query}"? ${context}`,
    6: `Step 6: Executive Summary. Final brief for: "${query}". ${context}`,
  };
  return prompts[agentId] + " Return as clean JSON.";
}

export async function POST(req: Request) {
  // FORCE LOG: This will show up in Vercel even if the stream fails
  console.log(">>> [PIPELINE] Request Received");

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Limit reached" }, { status: 429 });
  }

  try {
    const { query } = await req.json();
    console.log(">>> [PIPELINE] Query:", query);

    const encoder = new TextEncoder();
    const previousOutputs: string[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // USE STABLE 2.5 FLASH (April 2026 Standard)
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          for (let agentId = 1; agentId <= 6; agentId++) {
            console.log(`>>> [PIPELINE] Starting Agent ${agentId}`);
            send({ type: "start", agentId });

            const prompt = buildPrompt(agentId, query, previousOutputs);
            const result = await model.generateContentStream(prompt);
            
            let rawText = "";
            for await (const chunk of result.stream) {
              const text = chunk.text();
              rawText += text;
              send({ type: "stream", agentId, chunk: text });
            }

            let parsedData = {};
            try {
              const clean = rawText.replace(/```json|```/g, "").trim();
              parsedData = JSON.parse(clean);
            } catch {
              parsedData = { content: rawText };
            }

            previousOutputs.push(rawText.slice(0, 500));
            send({ type: "data", agentId, data: parsedData });
          }

          send({ type: "done" });
          console.log(">>> [PIPELINE] Completed Successfully");
        } catch (err: any) {
          console.error(">>> [PIPELINE] Stream Error:", err.message);
          send({ type: "error", message: err.message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    console.error(">>> [PIPELINE] Global POST Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

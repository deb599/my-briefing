import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with your API Key
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
  if (entry.count >= 20) return false; // Increased limit because Gemini is cheaper!
  entry.count++;
  return true;
}

/* ─── Agent prompts (Keeping your logic exactly the same) ─── */
function buildPrompt(agentId: number, query: string, previousOutputs: string[]): string {
  const context = previousOutputs.length
    ? `\nPrevious agent outputs for context:\n${previousOutputs.join("\n\n")}\n`
    : "";

  const prompts: Record<number, string> = {
    1: `You are Agent 01 – Sentiment Listener...`, // [Your existing prompts here]
    // ... Copy the rest of your prompts here
  };
  return prompts[agentId] ?? `Analyse: "${query}"`;
}

function sseEvent(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });
  }

  const { query } = await req.json();
  const encoder = new TextEncoder();
  const previousOutputs: string[] = [];

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(encoder.encode(sseEvent(data)));

      try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" } // Forces JSON output
        });

        for (let agentId = 1; agentId <= 6; agentId++) {
          send({ type: "agent_start", agentId });

          const prompt = buildPrompt(agentId, query, previousOutputs);
          
          // Gemini Streaming
          const result = await model.generateContentStream(prompt);
          let rawText = "";

          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            rawText += chunkText;
            send({ type: "agent_text", agentId, chunk: chunkText });
          }

          let parsedData = {};
          try {
            parsedData = JSON.parse(rawText);
          } catch {
            parsedData = { raw: rawText };
          }

          previousOutputs.push(`Agent ${agentId} output: ${rawText.slice(0, 500)}`);
          send({ type: "agent_complete", agentId, data: parsedData });
        }

        send({ type: "pipeline_complete", executedAt: new Date().toISOString() });
      } catch (err) {
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

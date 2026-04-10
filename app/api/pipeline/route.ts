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
  if (entry.count >= 20) return false; 
  entry.count++;
  return true;
}

/* ─── Agent Prompts (6-Agent Configuration) ─── */
function buildPrompt(agentId: number, query: string, previousOutputs: string[]): string {
  const context = previousOutputs.length
    ? `\nPrevious agent outputs for context:\n${previousOutputs.join("\n\n")}\n`
    : "";

  const prompts: Record<number, string> = {
    1: `You are Agent 01 – Sentiment Listener. Analyze the emotional undertones and public sentiment regarding: "${query}". ${context} Return your analysis in a structured JSON format.`,
    2: `You are Agent 02 – Strategic Analyst. Identify the high-level business implications and competitive landscape for: "${query}". ${context} Return your analysis in a structured JSON format.`,
    3: `You are Agent 03 – Risk Auditor. Detail the potential technical, financial, or reputational risks associated with: "${query}". ${context} Return your analysis in a structured JSON format.`,
    4: `You are Agent 04 – Opportunity Scout. Highlight the immediate wins and long-term growth opportunities for: "${query}". ${context} Return your analysis in a structured JSON format.`,
    5: `You are Agent 05 – Technical Architect. Outline the specific tools, workflows, or technical stacks required to execute on: "${query}". ${context} Return your analysis in a structured JSON format.`,
    6: `You are Agent 06 – Executive Summary. Synthesize all previous agent findings into a cohesive, high-leverage action plan for: "${query}". ${context} Return your analysis in a structured JSON format.`,
  };
  return prompts[agentId] ?? `Analyze: "${query}"`;
}

function sseEvent(data: object): string {
  // Using \n\n is critical for the frontend reader to split chunks correctly
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Daily limit reached." }, { status: 429 });
  }

  try {
    const { query } = await req.json();
    const encoder = new TextEncoder();
    const previousOutputs: string[] = [];

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => controller.enqueue(encoder.encode(sseEvent(data)));

        try {
          const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            // generationConfig: { responseMimeType: "application/json" } 
            // Note: If you force JSON, ensure your prompt is strictly JSON-only.
          });

          for (let agentId = 1; agentId <= 6; agentId++) {
            // Updated types to match frontend listeners
            send({ type: "start", agentId });

            const prompt = buildPrompt(agentId, query, previousOutputs);
            
            // Gemini Streaming
            const result = await model.generateContentStream(prompt);
            let rawText = "";

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              rawText += chunkText;
              send({ type: "stream", agentId, chunk: chunkText });
            }

            let parsedData = {};
            try {
              // Clean common markdown wrappers if present
              const cleanText = rawText.replace(/```json|```/g, "").trim();
              parsedData = JSON.parse(cleanText);
            } catch {
              parsedData = { content: rawText };
            }

            previousOutputs.push(`Agent ${agentId} output: ${rawText.slice(0, 500)}`);
            send({ type: "data", agentId, data: parsedData });
          }

          send({ type: "done" });
        } catch (err) {
          console.error("Pipeline Stream Error:", err);
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
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
  }
}

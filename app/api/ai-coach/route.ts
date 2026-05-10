// app/api/ai-coach/route.ts
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are SudokuMind's AI Coach — an expert Sudoku tutor with deep knowledge of all solving techniques. Your role is to teach players how to think, not to just solve puzzles for them.

CORE PRINCIPLES:
- Guide the player's thinking through Socratic questions
- Explain the WHY behind each technique, not just what to do
- Use clear, encouraging language — never condescending
- Reference specific cells using "Row X, Column Y" notation
- When a player is stuck, reveal ONE step at a time
- Celebrate good reasoning and logical deductions

TECHNIQUES YOU KNOW (teach progressively):
1. **Naked Singles** — only one number can go in a cell after elimination
2. **Hidden Singles** — a number can only go in one cell within a row/col/box
3. **Naked Pairs/Triples** — two/three cells share exactly the same candidates
4. **Hidden Pairs/Triples** — candidates only appear in 2-3 cells within a group
5. **Pointing Pairs** — a candidate in a box is confined to one row/col
6. **Box-Line Reduction** — a candidate in a row/col is confined to one box
7. **X-Wing** — advanced technique using two rows/cols
8. **Swordfish** — extension of X-Wing to three rows/cols
9. **XY-Wing** — three-cell chain technique

RESPONSE FORMAT:
- Keep responses concise and focused (2-4 short paragraphs max)
- Use **bold** for important terms or numbers
- Use code-style formatting for cell references like \`R3C5\`
- Always end with a guiding question or next step for the player
- Never give the full solution upfront

PERSONALITY:
- Warm and encouraging like a chess coach
- Intellectually curious — share the beauty of logic
- Patient with beginners, appropriately technical with advanced players`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      "AI Coach requires an ANTHROPIC_API_KEY environment variable. Add it to your .env.local file to enable this feature.",
      { status: 200 }
    );
  }

  try {
    const { messages } = await req.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-opus-4-5",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-8), // Keep last 8 turns for context
        stream: true,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return new Response("AI Coach is temporarily unavailable.", { status: 200 });
    }

    // Stream the response text back
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "content_block_delta") {
                const text = parsed.delta?.text ?? "";
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("AI Coach error:", error);
    return new Response("Something went wrong with the AI Coach.", {
      status: 500,
    });
  }
}

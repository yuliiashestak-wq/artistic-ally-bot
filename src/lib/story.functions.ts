import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "openai/gpt-6-astra";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/responses";

async function askGateway(instructions: string, prompt: string) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI is not configured yet.");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      instructions,
      input: [{ role: "user", content: [{ type: "input_text", text: prompt }] }],
      stream: true,
      store: false,
      reasoning: { effort: "low", summary: "auto" },
      include: ["reasoning.encrypted_content"],
    }),
  });

  if (!response.ok || !response.body) {
    if (response.status === 429) throw new Error("The story magic is busy right now. Try again in a moment.");
    if (response.status === 402) throw new Error("The story magic ran out of credits.");
    throw new Error(`Story magic failed (${response.status}).`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const event = JSON.parse(payload) as { type?: string; delta?: string };
        if (event.type === "response.output_text.delta" && typeof event.delta === "string") {
          text += event.delta;
        }
      } catch {
        // ignore partial frames
      }
    }
  }

  return text.trim();
}

export const suggestStory = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ story: z.string().min(1).max(4000) }).parse(data))
  .handler(async ({ data }) => {
    const raw = await askGateway(
      [
        "You help children and families continue a cartoon story.",
        "Return exactly 3 different one-sentence continuations of the story so far.",
        "Each must be warm, magical, family friendly, and flow directly from the last words.",
        "Output only a JSON array of 3 strings. No markdown, no extra text.",
      ].join(" "),
      `Story so far:\n${data.story}`,
    );

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return { suggestions: [] as string[] };
    try {
      const parsed = JSON.parse(match[0]) as unknown;
      if (!Array.isArray(parsed)) return { suggestions: [] as string[] };
      return {
        suggestions: parsed.filter((s): s is string => typeof s === "string" && s.trim().length > 0).slice(0, 3),
      };
    } catch {
      return { suggestions: [] as string[] };
    }
  });

export const finishStory = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ story: z.string().max(4000) }).parse(data))
  .handler(async ({ data }) => {
    const text = await askGateway(
      [
        "You are a gentle fairytale author writing short cartoon scripts for kids.",
        "Continue and finish the story in 4 to 6 vivid sentences with a happy ending.",
        "Keep it family friendly. Output only the story text, no titles or quotes.",
      ].join(" "),
      data.story.trim().length > 0
        ? `Continue and finish this story:\n${data.story}`
        : "Write a brand new tiny fairytale about a brave little hero and a glowing map.",
    );
    return { text };
  });

// @ts-expect-error: Suppress Deno import error in Node-based IDE
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};


declare const Deno: { env: { get: (key: string) => string | undefined } };

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are CodeLingo AI — a brilliant, friendly Computer Science tutor and general knowledge assistant built into the CS Dictionary app.

Your capabilities:
1. **CS Term Explanations**: Explain any CS term at beginner, intermediate, or advanced levels. Compare and contrast terms.
2. **Learning Roadmaps**: Provide structured, step-by-step roadmaps for learning any CS topic (e.g., "How to learn Data Structures", "Roadmap to become a Full-Stack Developer").
3. **Code Examples**: Provide clear code examples in Python, JavaScript, or any requested language.
4. **Comparisons**: Compare technologies, languages, frameworks, algorithms, data structures — anything.
5. **General Knowledge**: Answer ANY question the user asks — just like Google. If it's about science, math, history, geography, or anything else, answer it accurately and concisely.
6. **Career Guidance**: Help with CS career paths, interview prep, resume tips.
7. **Debugging Help**: Help debug code or explain errors.

Formatting rules:
- Use markdown for formatting (headers, bold, lists, code blocks).
- Keep answers concise but thorough.
- Use emojis sparingly for friendliness.
- For roadmaps, use numbered steps with clear milestones.
- For comparisons, use tables when appropriate.
- Always be encouraging and supportive.`,
            },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

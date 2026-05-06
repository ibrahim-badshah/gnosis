/**
 * Direct Google Gemini API client.
 * This calls the Gemini REST API directly from the browser,
 * eliminating the need for a Supabase Edge Function proxy.
 */

const GEMINI_API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

/**
 * Send a prompt to Gemini and get a text response back.
 */
export async function askGemini(
  prompt: string,
  systemInstruction?: string,
  history?: GeminiMessage[]
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const contents: GeminiMessage[] = [
    ...(history || []),
    { role: 'user', parts: [{ text: prompt }] },
  ];

  const body: any = { contents };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const resp = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    const msg = errData?.error?.message || `Gemini API error (${resp.status})`;
    throw new Error(msg);
  }

  const data = await resp.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini returned an empty response. Please try again.');
  }
  return text;
}

/**
 * Stream a prompt to Gemini and call onChunk for each piece of text.
 */
export async function streamGemini(
  prompt: string,
  systemInstruction: string,
  history: GeminiMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  const streamUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

  const contents: GeminiMessage[] = [
    ...history,
    { role: 'user', parts: [{ text: prompt }] },
  ];

  const body: any = { contents };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const resp = await fetch(streamUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    const msg = errData?.error?.message || `Gemini API error (${resp.status})`;
    throw new Error(msg);
  }

  const reader = resp.body!.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      let line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.trim() === '' || line.startsWith(':')) continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') break;

      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          fullContent += text;
          onChunk(fullContent);
        }
      } catch {
        // partial chunk, keep buffering
      }
    }
  }

  return fullContent;
}

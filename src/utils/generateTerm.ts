import type { Term, Category } from '../data/types';
import { categories } from '../data/types';
import { allTerms } from '../data/dictionary';
import { supabase } from './supabaseClient';

// Use the original project's Edge Function for AI (it has the LOVABLE_API_KEY configured)
const CHAT_URL = 'https://yqbusaltblxdviotfyjs.supabase.co/functions/v1/chat';
const CHAT_AUTH = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxYnVzYWx0Ymx4ZHZpb3RmeWpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODU2NTUsImV4cCI6MjA5MTA2MTY1NX0.iJLP5kEM_oSb__VOcJcM6ypap2J2h7GTx5OSYKn7lDw';

/* ══════════════════════════════════════════
   Client-side Input Validation
   ══════════════════════════════════════════ */

/** Common non-CS words / stop words that should be rejected outright */
const BLOCKED_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'hello', 'hi', 'hey', 'bye', 'please', 'thanks', 'thank', 'yes', 'no',
  'ok', 'okay', 'lol', 'lmao', 'bruh', 'yo', 'what', 'why', 'how', 'who',
  'test', 'testing', 'asdf', 'qwerty', 'abc', 'xyz', 'aaa', 'bbb', 'zzz',
  'fuck', 'shit', 'damn', 'ass', 'hell', 'bitch', 'crap', 'dick', 'porn',
  'sex', 'nude', 'kill', 'die', 'hate', 'stupid', 'idiot', 'dumb',
  'food', 'pizza', 'burger', 'eat', 'drink', 'water', 'coffee',
  'love', 'happy', 'sad', 'angry', 'feel', 'emotion',
  'dog', 'cat', 'fish', 'bird', 'animal', 'pet',
  'car', 'bus', 'train', 'plane', 'boat', 'bike',
  'movie', 'music', 'song', 'game', 'play', 'sport', 'football', 'cricket',
  'school', 'teacher', 'student', 'homework', 'exam',
  'money', 'dollar', 'rupee', 'euro', 'price', 'buy', 'sell',
  'weather', 'rain', 'sun', 'hot', 'cold', 'warm',
  'color', 'red', 'blue', 'green', 'yellow', 'black', 'white',
  'country', 'city', 'india', 'usa', 'china', 'pakistan',
]);

/** Characters allowed in CS term names (letters, digits, spaces, hyphens, +, #, /, ., *) */
const VALID_TERM_PATTERN = /^[a-zA-Z0-9\s\-+#/.*()']+$/;

/** Minimum characters for a valid term */
const MIN_LENGTH = 2;
/** Maximum characters for the full term */
const MAX_LENGTH = 40;
/** Maximum number of words */
const MAX_WORDS = 3;

/**
 * Validates the search query BEFORE sending to AI.
 * Throws a descriptive error if invalid.
 */
export function validateTermInput(query: string): string {
  const trimmed = query.trim();

  // 1. Not empty
  if (!trimmed) {
    throw new Error('Please enter a term to search for.');
  }

  // 2. Length check
  if (trimmed.length < MIN_LENGTH) {
    throw new Error(`Term must be at least ${MIN_LENGTH} characters long.`);
  }
  if (trimmed.length > MAX_LENGTH) {
    throw new Error(`Term is too long (max ${MAX_LENGTH} characters). Enter a concise CS term, not a sentence.`);
  }

  // 3. Word count check (1-3 words)
  const words = trimmed.split(/\s+/);
  if (words.length > MAX_WORDS) {
    throw new Error(
      `Please enter a concise term (1-${MAX_WORDS} words).\n\nExamples: "Binary Tree", "API Gateway", "Recursion"\n\nDo not enter sentences or long phrases.`
    );
  }

  // 4. Valid characters only
  if (!VALID_TERM_PATTERN.test(trimmed)) {
    throw new Error(
      'Term contains invalid characters.\n\nOnly letters, numbers, spaces, hyphens, and symbols like +, #, / are allowed.'
    );
  }

  // 5. Not all numbers
  if (/^\d+$/.test(trimmed)) {
    throw new Error('Please enter a valid CS term, not just numbers.');
  }

  // 6. Not a single character (unless it's a known CS term like C)
  if (trimmed.length === 1 && !['C', 'R'].includes(trimmed.toUpperCase())) {
    throw new Error('Please enter a more specific term.');
  }

  // 7. Check against blocked words
  const lowerWords = words.map(w => w.toLowerCase());
  if (words.length === 1 && BLOCKED_WORDS.has(lowerWords[0])) {
    throw new Error(
      `"${trimmed}" is not a Computer Science term.\n\nPlease enter a term related to programming, algorithms, data structures, networking, or other CS topics.`
    );
  }

  // 8. If all words are blocked stop-words, reject
  if (lowerWords.every(w => BLOCKED_WORDS.has(w))) {
    throw new Error(
      `"${trimmed}" does not appear to be a Computer Science term.\n\nPlease enter a specific CS concept like "Hash Map", "REST API", or "Mutex".`
    );
  }

  // 9. Detect gibberish (repeated chars, no vowels in long words)
  for (const word of words) {
    if (word.length < 3) continue;
    // Repeated char pattern (aaaa, xxxx)
    if (/(.)\1{3,}/.test(word)) {
      throw new Error('That looks like gibberish. Please enter a real CS term.');
    }
    // No vowels in a word longer than 4 chars (probably gibberish)
    if (word.length > 4 && !/[aeiouAEIOU]/.test(word) && !/^[A-Z]+$/.test(word)) {
      throw new Error('That doesn\'t appear to be a valid term. Please try a real CS term.');
    }
  }

  // 10. Check if already in dictionary
  const lower = trimmed.toLowerCase();
  const existing = allTerms.find(
    t => t.word.toLowerCase() === lower || t.id === lower.replace(/\s+/g, '-')
  );
  if (existing) {
    throw new Error(
      `"${existing.word}" is already in the dictionary!\n\nYou can search for it and view its definition directly.`
    );
  }

  return trimmed;
}

/* ══════════════════════════════════════════
   AI Term Generation
   ══════════════════════════════════════════ */

/**
 * Calls the Supabase edge function (Lovable/Gemini) to generate
 * a complete Term object for a word not in the dictionary.
 */
export async function generateTermWithAI(word: string): Promise<Term> {
  // ── Step 1: Validate input BEFORE calling AI ──
  const validatedWord = validateTermInput(word);

  // ── Step 2: Build the AI prompt ──
  const systemPrompt = `You are a precise CS dictionary data generator. 
Given a computer science term, return ONLY a valid JSON object (no markdown, no backticks, no explanation) that matches this exact TypeScript interface:

{
  "id": string,           // lowercase-kebab-case
  "word": string,         // properly capitalized term name
  "category": string,     // one of: ${categories.join(', ')}
  "pronunciation": string, // phonetic guide
  "explanation": {
    "beginner": string,    // 2-3 sentences, simple language, use analogies
    "intermediate": string, // 3-4 sentences, technical but accessible
    "expert": string       // 3-5 sentences, deep technical detail
  },
  "codeExample": {
    "language": string,    // "javascript", "python", "typescript", etc.
    "code": string,        // working code example (use \\n for newlines)
    "description": string  // what the code demonstrates
  },
  "relatedTerms": [],
  "historicalContext": string,  // 1-2 sentences about origin/history
  "tags": string[]         // 2-4 lowercase tags
}

Rules:
- Return ONLY the JSON object, nothing else
- All string values must use double quotes
- The code example must be real, working code (not pseudo-code)
- Explanations must be accurate and educational
- Pick the most fitting category from the allowed list
- CRITICAL VALIDATION: Before generating ANY content, you MUST first determine whether the provided word/phrase is a legitimate Computer Science, Software Engineering, Information Technology, Programming, Mathematics (as applied to CS), or related technical term.
- If the word is about cooking, sports, medicine, entertainment, politics, animals, fashion, geography, general vocabulary, or ANY other non-CS/non-tech domain, you MUST refuse and return EXACTLY: {"error": "NOT_CS_TERM"}
- If the input appears to be gibberish, random characters, a sentence, or a question, return EXACTLY: {"error": "NOT_CS_TERM"}
- Examples of valid CS terms: algorithm, API, recursion, blockchain, neural network, TCP/IP, polymorphism, docker, kubernetes
- Examples of INVALID terms: pizza, football, cat, democracy, photosynthesis, guitar, ocean, "how does a computer work", "what is coding"
- When in doubt, reject the term and return {"error": "NOT_CS_TERM"}`;

  const messages = [
    { role: 'user', content: `Generate a complete dictionary entry for the CS term: "${validatedWord}"` }
  ];

  // ── Step 3: Call the AI ──
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CHAT_AUTH}`,
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: systemPrompt + '\n\n' + messages[0].content }
      ]
    }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to contact AI service');
  }

  // Read the full streamed response
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
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') break;

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) fullContent += content;
      } catch {
        // partial chunk, keep buffering
      }
    }
  }

  // ── Step 4: Parse AI response ──
  let jsonText = fullContent.trim();
  
  // Strip markdown code fences if present
  const jsonMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }
  
  // Find the outermost { ... }
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  }

  let term: any;
  try {
    term = JSON.parse(jsonText);
  } catch (e) {
    throw new Error('AI returned invalid JSON. Please try again.');
  }

  // ── Step 5: Check AI-side rejection ──
  if (term.error === 'NOT_CS_TERM') {
    throw new Error(
      `"${validatedWord}" is not related to Computer Science.\n\nPlease enter a term related to programming, software engineering, algorithms, data structures, networking, databases, AI/ML, cybersecurity, or other CS topics.`
    );
  }

  // Secondary client-side validation: check if the AI-assigned category is valid CS
  const validCSCategories = categories;
  if (term.category && !validCSCategories.includes(term.category)) {
    throw new Error(
      `"${validatedWord}" does not appear to be a Computer Science term.\n\nPlease enter a term related to programming, software engineering, algorithms, data structures, networking, databases, AI/ML, cybersecurity, or other CS topics.`
    );
  }

  // ── Step 6: Validate and sanitize the term ──
  if (!term.id) term.id = validatedWord.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!term.word) term.word = validatedWord;
  if (!term.category || !categories.includes(term.category as Category)) {
    term.category = 'Algorithms' as Category; // fallback
  }
  if (!term.pronunciation) term.pronunciation = validatedWord.toUpperCase();
  if (!term.explanation?.beginner) {
    term.explanation = {
      beginner: `${validatedWord} is a concept in computer science.`,
      intermediate: `${validatedWord} involves specific techniques and patterns.`,
      expert: `${validatedWord} requires deep understanding of underlying mechanisms.`,
    };
  }
  if (!term.codeExample) {
    term.codeExample = {
      language: 'javascript',
      code: `// ${validatedWord} example\nconsole.log("${validatedWord}");`,
      description: `Basic example of ${validatedWord}`,
    };
  }
  if (!term.historicalContext) term.historicalContext = `${validatedWord} is a notable concept in computer science.`;
  if (!term.tags || !Array.isArray(term.tags)) term.tags = [term.category.toLowerCase().replace(/\s/g, '-')];

  // Ensure relatedTerms exist and are valid by filtering against allTerms
  let validRelated = Array.isArray(term.relatedTerms) 
    ? term.relatedTerms.filter((id: string) => allTerms.some(t => t.id === id))
    : [];

  // If no valid related terms, pick some random ones from the same category
  if (validRelated.length === 0) {
    const sameCat = allTerms.filter(t => t.category === term.category && t.id !== term.id);
    const shuffled = sameCat.sort(() => 0.5 - Math.random());
    validRelated = shuffled.slice(0, 4).map(t => t.id);
  }
  term.relatedTerms = validRelated;

  // ── Step 7: Persist to Supabase (shared with all users) ──
  try {
    const { error } = await supabase.from('dynamic_terms').insert({
      id: term.id,
      term_data: term,
    });
    if (error) {
      console.warn('Could not save to Supabase (shared DB), falling back to local storage:', error.message);
      // Still save locally
      persistToLocalStorage(term);
    }
  } catch (e) {
    // Persist to localStorage as fallback
    persistToLocalStorage(term);
  }

  return term;
}

/** Save term to localStorage as fallback when Supabase is unavailable */
function persistToLocalStorage(term: Term) {
  try {
    const stored = JSON.parse(localStorage.getItem('gnosis-dynamic-terms') || '[]');
    if (!stored.some((t: Term) => t.id === term.id)) {
      stored.push(term);
      localStorage.setItem('gnosis-dynamic-terms', JSON.stringify(stored));
    }
  } catch {
    // silently fail
  }
}

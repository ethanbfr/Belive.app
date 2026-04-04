export const config = { runtime: 'edge' };

export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  const KEY = process.env.GEMINI_KEY;
  if (!KEY) return new Response(JSON.stringify({ error: 'no key' }), { status: 500, headers: cors });

  const { messages } = await req.json();

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: messages, generationConfig: { maxOutputTokens: 1000 } })
    }
  );

  const d = await r.json();
  const text = d.candidates?.[0]?.content?.parts?.[0]?.text;
  return new Response(JSON.stringify({ text: text || null, raw: text ? null : d }), { headers: cors });
}

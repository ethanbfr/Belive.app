export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const GROQ_KEY = process.env.GROQ_KEY;
  if (!GROQ_KEY) return res.status(500).json({ error: 'no key' });

  try {
    const { messages } = req.body;

    // Convertir le format Gemini vers OpenAI/Groq
    const groqMessages = messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.parts.map(p => p.text).join('')
    }));

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: groqMessages,
        max_tokens: 1000,
        temperature: 0.8
      })
    });

    const data = await r.json();
    const text = data.choices?.[0]?.message?.content;

    if (text) return res.status(200).json({ text });
    return res.status(500).json({ error: JSON.stringify(data).slice(0, 200) });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}

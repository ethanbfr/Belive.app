export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const GEMINI_KEY = process.env.GEMINI_KEY;
  
  if (!GEMINI_KEY) {
    console.error('GEMINI_KEY manquante !');
    return res.status(500).json({ error: 'GEMINI_KEY not configured' });
  }

  try {
    const { messages } = req.body;
    
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: messages,
          generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
        })
      }
    );

    const data = await geminiRes.json();
    
    if (!geminiRes.ok) {
      console.error('Gemini error:', JSON.stringify(data));
      return res.status(geminiRes.status).json(data);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('No text in response:', JSON.stringify(data));
      return res.status(500).json({ error: 'No text in Gemini response' });
    }

    return res.status(200).json({ text });
    
  } catch (e) {
    console.error('Exception:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

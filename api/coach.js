export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Cherche la clé dans les deux noms possibles
  const GEMINI_KEY = process.env.GEMINI_KEY || process.env.VITE_GEMINI_KEY;
  
  if (!GEMINI_KEY) {
    console.error('Aucune clé Gemini trouvée (GEMINI_KEY ou VITE_GEMINI_KEY)');
    return res.status(500).json({ error: 'Clé API manquante' });
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
      console.error('Erreur Gemini:', geminiRes.status, JSON.stringify(data).slice(0, 200));
      return res.status(500).json({ error: `Gemini error ${geminiRes.status}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('Pas de texte dans la réponse:', JSON.stringify(data).slice(0, 200));
      return res.status(500).json({ error: 'No text in response' });
    }

    return res.status(200).json({ text });

  } catch (e) {
    console.error('Exception coach.js:', e.message);
    return res.status(500).json({ error: e.message });
  }
}

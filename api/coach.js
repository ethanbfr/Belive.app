export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const GROQ_KEY = process.env.GROQ_KEY;
  if (!GROQ_KEY) return res.status(500).json({ error: 'no key' });

  try {
    const { messages, userName, avgViewers } = req.body;

    const systemMessage = {
      role: 'system',
      content: `Tu es un coach expert UNIQUEMENT dans ces domaines :
- Live streaming : Twitch, TikTok Live, YouTube Live
- Jeux vidéo : stratégies, conseils gaming, actualité jeux
- Croissance de chaîne : viewers, followers, algorithmes
- Monétisation streaming : subs, bits, dons, partenariats gaming
- Technique streaming : OBS, setup micro, caméra, bitrate
- Communauté : raids, co-streams, Discord gaming

RÈGLE ABSOLUE : Si la question ne concerne PAS le streaming ou les jeux vidéo, réponds exactement : "Je suis spécialisé uniquement dans le live streaming et les jeux vidéo ! Pose-moi une question sur ce sujet 🎮"

RÈGLE IMPORTANTE : Tu te souviens de TOUTE la conversation. Si quelqu'un dit qu'il a déjà essayé quelque chose ou que ça ne marche pas, tu proposes des stratégies DIFFÉRENTES et NOUVELLES. Tu n'répètes jamais la même chose. Tu approfondis vraiment avec des exemples concrets, des chiffres précis, des outils spécifiques.

Le créateur s'appelle ${userName || 'le créateur'} et a ${avgViewers || 0} viewers en moyenne.
Réponds toujours en français, sois direct et concret.`
    };

    const groqMessages = [systemMessage];
    for (const m of (messages || [])) {
      const role = m.role === 'model' ? 'assistant' : (m.role === 'user' ? 'user' : null);
      if (role) {
        const text = Array.isArray(m.parts) ? m.parts.map(p => p.text).join('') : m.content || '';
        if (text.trim()) groqMessages.push({ role, content: text });
      }
    }

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
        temperature: 0.7
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

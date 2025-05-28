import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'https://ecosystem-project-zion-ayokunnus-projects.vercel.app'
}));

app.use(express.json());

app.options('https://ecosystem-project-production.up.railway.app/local-llm', (req, res) => {
  console.log("🔍 This one up. Sending prompt to LLM:", prompt);
  console.log("➡️ LLM API endpoint:", 'https://ecosystem-project-production.up.railway.app/local-llm');
  res.setHeader('Access-Control-Allow-Origin', 'https://ecosystem-project-zion-ayokunnus-projects.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

console.log('✅ ROUTE ACTIVE - /local-llm');

app.post('https://ecosystem-project-production.up.railway.app/local-llm', async (req, res) => {
  const { prompt } = req.body;
  console.log('🧠 Received prompt:', prompt);

  try {
    console.log("🔍 Sending prompt to LLM:", prompt);
    console.log("➡️ LLM API endpoint:", 'https://ecosystem-project-production.up.railway.app/local-llm');
    const openai = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!openai.ok) {
      const errorText = await openai.text();
      console.error('❌ OpenAI error:', errorText);
      return res.status(openai.status).json({ error: errorText });
    }

    const data = await openai.json();
    console.log('✅ OpenAI response:', data);
    res.json({ analysisText: data.choices[0].message.content });
  } catch (err) {
    console.error('💥 Unexpected error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

if (app._router && app._router.stack) {
  app._router.stack
    .filter(r => r.route)
    .forEach(r => {
      const method = Object.keys(r.route.methods)[0].toUpperCase();
      const path = r.route.path;
      console.log(`[Route] ${method} ${path}`);
    });
} else {
  console.warn('⚠️ Could not access app._router.stack — route logging skipped.');
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`LLM proxy listening on http://localhost:${PORT}`);
});
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();

app.use(cors({
  origin: 'https://ecosystem-project-iypg9rmlb-zion-ayokunnus-projects.vercel.app'
}));

app.use(express.json());

app.post('/api/local-llm', async (req, res) => {
  const { prompt } = req.body;

  // Fetch to OpenAI API for completions
  const openai = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!openai.ok) {
    return res.status(openai.status).json({ error: await openai.text() });
  }

  const data = await openai.json();
  res.json({ analysisText: data.choices[0].text });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`LLM proxy listening on http://localhost:${PORT}`);
});
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

//  ➜  POST /api/local-llm  { prompt: "..." }
app.post('/api/local-llm', async (req, res) => {
  const { prompt } = req.body;

  // forward to Ollama
  const ollama = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'tinyllama:1.1b',       // <-- the model you pulled
      prompt,
      stream: false             // we just want the full answer
    })
  });

  if (!ollama.ok) {
    return res.status(ollama.status).json({ error: await ollama.text() });
  }

  // Ollama’s /generate returns { response: "…", … }
  const data = await ollama.json();
  res.json({ analysisText: data.response });
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`LLM proxy listening on http://localhost:${PORT}`);
});
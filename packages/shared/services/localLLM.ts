
// NOTE: Platform-specific asset loading - implement in consuming app
// import contextText from '@/assets/llmContext.md?raw';
const contextText = ''; // Placeholder - load from platform-specific asset loader

interface LLMResponse {
  analysisText: string;
}

interface LLMRequest {
  model: string;
  prompt: string;
}

export const queryLocalLLM = async (
  prompt: string,
  mode: 'business' | 'community' = 'community'
): Promise<string> => {
  try {
    // Build context-aware prompt
    const contextualPrompt = `${contextText}

  [Context: Provide brief, eloquent, clear, simple, actionable, motivating analysis tailored to the ${mode} domain. Adopt a tone that blends strategic consulting, urgency, encouraging mentorship, and values-driven advocacy. Avoid passive observation—recommend meaningful direction.]

  ${prompt}`;

    const request: LLMRequest = {
      model: "local-llm",
      prompt: contextualPrompt
    };
    console.log("🔍 Sending prompt to LLM:", prompt);
    console.log("➡️ LLM API endpoint:", import.meta.env.VITE_LLM_API_URL || "/api/local-llm");
    const response = await fetch(
      import.meta.env.VITE_LLM_API_URL || "/api/local-llm",
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: contextualPrompt }),
      }
    );

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const data: LLMResponse = await response.json();
    console.log('[localLLM] raw response from proxy:', data);
    return data.analysisText;
  } catch (error) {
    console.error('Local LLM query failed:', error);
    throw error;
  }
};

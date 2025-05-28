
import contextText from '@/assets/llmContext.md?raw';

interface LLMResponse {
  analysisText: string;
}

interface LLMRequest {
  model: string;
  prompt: string;
}

export const queryLocalLLM = async (
  prompt: string,
  mode: 'business' | 'community' = 'business'
): Promise<string> => {
  try {
    // Build context-aware prompt
    const contextualPrompt = `${contextText}

  [Context: Respond as a ${mode} stakeholder perspective]

  ${prompt}`;


    const request: LLMRequest = {
      model: "local-llm",
      prompt: contextualPrompt
    };

    // Simulate API call to local LLM (replace with actual endpoint)
    const response = await fetch('/api/local-llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'tinyllama:1.1b', prompt: contextualPrompt })
    });

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

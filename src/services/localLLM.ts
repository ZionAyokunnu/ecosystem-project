
interface LLMResponse {
  analysisText: string;
}

interface LLMRequest {
  model: string;
  prompt: string;
}

export const queryLocalLLM = async (prompt: string): Promise<string> => {
  try {
    // For now, we'll simulate a local LLM response
    // In a real implementation, this would connect to your local LLM endpoint
    const request: LLMRequest = {
      model: "local-llm",
      prompt
    };

    // Simulate API call to local LLM (replace with actual endpoint)
    const response = await fetch('/api/local-llm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model: 'tinyllama:1.1b', prompt })
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

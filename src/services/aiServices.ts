import { queryLocalLLM } from './localLLM';

export interface SuggestedInitiative {
  title: string;
  description: string;
  actionItems: string[];
  estimatedImpact: 'Low' | 'Medium' | 'High';
}

export const generateSuggestedInitiative = async (
  storyText: string,
  indicatorName: string,
  locationName: string
): Promise<SuggestedInitiative> => {
  const prompt = `Based on this community story about "${indicatorName}" in ${locationName}:

"${storyText}"

Generate a practical community initiative that could address the concern raised. Respond with:
- A clear title (max 60 chars)
- A brief description (max 200 chars)  
- 3-4 actionable items
- Estimated impact level (Low/Medium/High)

Format as JSON: {"title": "...", "description": "...", "actionItems": ["...", "..."], "estimatedImpact": "..."}`;

  try {
    const response = await queryLocalLLM(prompt, 'community');
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Error generating initiative:', error);
    return {
      title: 'Community Action Initiative',
      description: 'Work together to address local concerns through collaborative action.',
      actionItems: ['Organize community meeting', 'Identify key stakeholders', 'Develop action plan'],
      estimatedImpact: 'Medium'
    };
  }
};

export const generateFriendlyIndicatorName = async (
  indicatorName: string,
  category: string
): Promise<string> => {
  const prompt = `Convert this technical indicator name to a friendly, community-understandable phrase:

Technical name: "${indicatorName}"
Category: "${category}"

Make it conversational and relatable to residents. Maximum 50 characters. Return only the friendly name.`;

  try {
    const response = await queryLocalLLM(prompt, 'community');
    return response.trim().replace(/"/g, '');
  } catch (error) {
    console.error('Error generating friendly name:', error);
    return indicatorName;
  }
};
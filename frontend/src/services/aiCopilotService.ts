import apiClient from './apiClient';

export interface CopilotQueryResponse {
  query: string;
  response: string;
  keyInsights: string[];
  recommendedAction?: string;
  relatedAssetId?: string;
  confidenceScore: number;
  timestamp: string;
}

export const executeCopilotQuery = async (query: string): Promise<CopilotQueryResponse> => {
  try {
    const res = await apiClient.post('/copilot/authority/query', { query_text: query });
    const data = res.data.data;

    return {
      query: data.query,
      response: data.answer,
      keyInsights: data.grounded_facts.map((fact: any) => JSON.stringify(fact)), // Or format it nicely based on the structured data
      recommendedAction: data.recommended_actions?.[0] || 'No immediate action required.',
      confidenceScore: 95.0, // Hardcoded or extracted if backend provides it
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    console.error('Copilot query failed:', error);
    // Fallback response on error
    return {
      query,
      response: 'Error connecting to the Copilot Engine. Please try again later.',
      keyInsights: [],
      confidenceScore: 0,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
};

import apiClient from './client';
import type { AIMatchIntroRequest, AIMatchIntroResponse } from '@/types';

export const aiApi = {
  /**
   * Generates or fetches an AI-assisted personalized match introduction
   * using backend POST /api/ai/match-introduction (with automated fallback).
   */
  generateMatchIntroduction: async (
    payload: AIMatchIntroRequest
  ): Promise<AIMatchIntroResponse> => {
    const { data } = await apiClient.post<AIMatchIntroResponse>(
      '/api/ai/match-introduction',
      payload
    );
    return data;
  },
};

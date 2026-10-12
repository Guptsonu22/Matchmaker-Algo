import apiClient from './client';
import type { DashboardStats, MatchEvent, MatchSuggestion } from '@/types';

export const matchesApi = {
  getSuggestions: async (clientId: string): Promise<MatchSuggestion[]> => {
    const { data } = await apiClient.get<MatchSuggestion[]>(`/api/matches/suggestions/${clientId}`);
    return data;
  },

  sendMatch: async (clientId: string, candidateId: string): Promise<MatchEvent> => {
    const { data } = await apiClient.post<MatchEvent>('/api/matches/send', {
      clientId,
      candidateId,
    });
    return data;
  },

  getHistory: async (clientId: string): Promise<MatchEvent[]> => {
    const { data } = await apiClient.get<MatchEvent[]>(`/api/matches/history/${clientId}`);
    return data;
  },

  getEvent: async (clientId: string, eventId: string): Promise<MatchEvent> => {
    const { data } = await apiClient.get<MatchEvent>(`/api/matches/history/${clientId}/${eventId}`);
    return data;
  },

  getDashboardStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/api/stats/overview');
    return data;
  },
};

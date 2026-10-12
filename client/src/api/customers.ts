import apiClient from './client';
import type { Client, CustomerQueryParams, MatcherNote, PaginatedResponse } from '@/types';

export const customersApi = {
  list: async (params: CustomerQueryParams): Promise<PaginatedResponse<Client>> => {
    const { data } = await apiClient.get<PaginatedResponse<Client>>('/api/customers', { params });
    return data;
  },

  getById: async (id: string): Promise<Client> => {
    const { data } = await apiClient.get<Client>(`/api/customers/${id}`);
    return data;
  },

  updateStatus: async (id: string, journeyStatus: string): Promise<Client> => {
    const { data } = await apiClient.patch<Client>(`/api/customers/${id}/status`, { journeyStatus });
    return data;
  },

  getNotes: async (id: string): Promise<MatcherNote[]> => {
    const { data } = await apiClient.get<MatcherNote[]>(`/api/customers/${id}/notes`);
    return data;
  },

  addNote: async (id: string, note: string): Promise<MatcherNote> => {
    const { data } = await apiClient.post<MatcherNote>(`/api/customers/${id}/notes`, { note });
    return data;
  },

  updateNote: async (id: string, noteId: string, note: string): Promise<MatcherNote> => {
    const { data } = await apiClient.patch<MatcherNote>(`/api/customers/${id}/notes/${noteId}`, { note });
    return data;
  },

  deleteNote: async (id: string, noteId: string): Promise<void> => {
    await apiClient.delete(`/api/customers/${id}/notes/${noteId}`);
  },
};

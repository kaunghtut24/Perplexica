import axios from 'axios';
import { getSearxngApiEndpoint } from './config';

export interface SearxNGResult {
  title: string;
  url: string;
  content: string;
  img_src?: string;
  thumbnail?: string;
}

export interface SearxNGResponse {
  results: SearxNGResult[];
  query: string;
  number_of_results: number;
}

const searchSearxNG = async (query: string, category: string = 'general'): Promise<SearxNGResponse> => {
  try {
    const searxngUrl = getSearxngApiEndpoint();
    const response = await axios.get(`${searxngUrl}/search`, {
      params: {
        q: query,
        format: 'json',
        category: category,
      },
      headers: {
        'Accept': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('SearxNG search error:', error);
    throw new Error('Failed to perform search');
  }
};

export const searchImages = async (query: string): Promise<SearxNGResponse> => {
  return searchSearxNG(query, 'images');
};

export const searchVideos = async (query: string): Promise<SearxNGResponse> => {
  return searchSearxNG(query, 'videos');
};

export const searchNews = async (query: string): Promise<SearxNGResponse> => {
  return searchSearxNG(query, 'news');
};

export { searchSearxNG }; 
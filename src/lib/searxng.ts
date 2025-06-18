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

export async function searchSearxNG(query: string, category: string = 'general'): Promise<SearxNGResponse> {
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
}

export async function searchImages(query: string): Promise<SearxNGResponse> {
  return searchSearxNG(query, 'images');
}

export async function searchVideos(query: string): Promise<SearxNGResponse> {
  return searchSearxNG(query, 'videos');
}

export async function searchNews(query: string): Promise<SearxNGResponse> {
  return searchSearxNG(query, 'news');
} 
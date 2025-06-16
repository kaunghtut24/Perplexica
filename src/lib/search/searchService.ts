import axios from 'axios';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  source: 'serpapi' | 'tavily';
}

interface SearchOptions {
  num_results?: number;
  search_type?: 'web' | 'news' | 'places';
  language?: string;
}

export class SearchService {
  private serpApiKey: string;
  private tavilyApiKey: string;

  constructor() {
    this.serpApiKey = process.env.SERPAPI_API_KEY || '';
    this.tavilyApiKey = process.env.TAVILY_API_KEY || '';
  }

  private async searchWithSerpAPI(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: this.serpApiKey,
          num: opts?.num_results || 10,
          hl: opts?.language || 'en',
        },
      });

      return response.data.organic_results.map((result: any) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        source: 'serpapi' as const,
      }));
    } catch (error) {
      console.error('SerpAPI search failed:', error);
      return [];
    }
  }

  private async searchWithTavily(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
    try {
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.tavilyApiKey,
          query,
          search_depth: 'advanced',
          max_results: opts?.num_results || 10,
          include_domains: [],
          exclude_domains: [],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.results.map((result: any) => ({
        title: result.title,
        link: result.url,
        snippet: result.content,
        source: 'tavily' as const,
      }));
    } catch (error) {
      console.error('Tavily search failed:', error);
      return [];
    }
  }

  public async search(query: string, opts?: SearchOptions): Promise<SearchResult[]> {
    // Try SerpAPI first
    const serpResults = await this.searchWithSerpAPI(query, opts);
    
    // If SerpAPI fails or returns no results, try Tavily
    if (serpResults.length === 0) {
      const tavilyResults = await this.searchWithTavily(query, opts);
      return tavilyResults;
    }

    return serpResults;
  }
} 
import { z } from 'zod';

const envSchema = z.object({
  // Database
  POSTGRES_URL: z.string().min(1, 'PostgreSQL URL is required'),
  
  // API Keys
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  GOOGLE_API_KEY: z.string().optional(),
  GOOGLE_CSE_ID: z.string().optional(),
  SERPAPI_API_KEY: z.string().optional(),
  TAVILY_API_KEY: z.string().optional(),
  
  // Optional API endpoints
  SEARXNG_API_URL: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join('\n');
      throw new Error(`Missing or invalid environment variables:\n${missingVars}`);
    }
    throw error;
  }
}

// Validate environment variables early
export const env = validateEnv(); 
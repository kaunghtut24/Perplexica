import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { env } from '@/lib/utils/env';

export async function GET() {
  try {
    // Check database connection
    await sql`SELECT 1`;

    // Check required environment variables
    const envStatus = {
      openai: !!env.OPENAI_API_KEY,
      google: !!env.GOOGLE_API_KEY && !!env.GOOGLE_CSE_ID,
      search: !!env.SERPAPI_API_KEY || !!env.TAVILY_API_KEY,
    };

    // Get Node.js version
    const nodeVersion = process.version;
    
    // Get uptime in seconds
    const uptime = process.uptime();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        database: 'connected',
        ...envStatus,
      },
      system: {
        nodeVersion,
        uptime,
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 
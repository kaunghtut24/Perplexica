import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface RateLimitConfig {
  tokensPerInterval: number;
  interval: number; // in seconds
  identifier?: string;
}

export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Math.floor(Date.now() / 1000);
  const identifier = config.identifier || 
    req.headers.get('x-forwarded-for') || 
    'anonymous';
  
  try {
    // Get or create rate limit record
    const result = await sql`
      INSERT INTO rate_limits (identifier, tokens, last_updated)
      VALUES (${identifier}, ${config.tokensPerInterval}, ${now})
      ON CONFLICT (identifier)
      DO UPDATE SET
        tokens = CASE
          WHEN rate_limits.last_updated + ${config.interval} <= ${now}
          THEN ${config.tokensPerInterval}
          ELSE rate_limits.tokens
        END,
        last_updated = CASE
          WHEN rate_limits.last_updated + ${config.interval} <= ${now}
          THEN ${now}
          ELSE rate_limits.last_updated
        END
      RETURNING tokens, last_updated
    `;

    const record = result.rows[0];
    const resetTime = record.last_updated + config.interval;
    
    if (record.tokens > 0) {
      // Consume a token
      await sql`
        UPDATE rate_limits
        SET tokens = tokens - 1
        WHERE identifier = ${identifier}
      `;
      
      return {
        success: true,
        remaining: record.tokens - 1,
        reset: resetTime,
      };
    }

    return {
      success: false,
      remaining: 0,
      reset: resetTime,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow the request in case of errors
    return {
      success: true,
      remaining: 1,
      reset: now + config.interval,
    };
  }
}

export function createRateLimitResponse(
  remaining: number,
  reset: number,
  status = 429
): NextResponse {
  return new NextResponse(
    JSON.stringify({
      error: 'Too Many Requests',
      message: 'Please try again later',
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    }
  );
}

// Middleware to apply rate limiting
export async function withRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const rateLimitResult = await rateLimit(req, config);

  if (!rateLimitResult.success) {
    return createRateLimitResponse(
      rateLimitResult.remaining,
      rateLimitResult.reset
    );
  }

  const response = await handler(req);
  
  // Add rate limit headers to the response
  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toString());
  
  return response;
} 
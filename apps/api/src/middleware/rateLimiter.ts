import { Request, Response, NextFunction } from 'express';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import rateLimit from 'express-rate-limit';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const isUpstashConfigured = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

let upstashRedis: Redis | null = null;
if (isUpstashConfigured) {
  upstashRedis = new Redis({
    url: UPSTASH_URL!,
    token: UPSTASH_TOKEN!,
  });
}

// 1. Upstash Rate Limiters
const upstashAiRatelimit = isUpstashConfigured
  ? new Ratelimit({
      redis: upstashRedis!,
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/ai',
    })
  : null;

const upstashCodeRatelimit = isUpstashConfigured
  ? new Ratelimit({
      redis: upstashRedis!,
      limiter: Ratelimit.slidingWindow(20, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/code',
    })
  : null;

const upstashGeneralRatelimit = isUpstashConfigured
  ? new Ratelimit({
      redis: upstashRedis!,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/general',
    })
  : null;

// 2. Fallback Express Rate Limiters (for local dev without Upstash credentials)
const fallbackAiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 10,
  message: { success: false, message: 'Too many AI requests. Please wait 1 minute.' },
});

const fallbackCodeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 20,
  message: { success: false, message: 'Too many code execution requests. Please wait 1 minute.' },
});

const fallbackGeneralLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 100,
  message: { success: false, message: 'Too many requests. Please wait 1 minute.' },
});

/**
 * AI Rate Limiter Middleware (10 req / 1 min)
 */
export const aiLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (upstashAiRatelimit) {
    const identifier = req.user?.id || req.ip || 'anonymous';
    const { success, limit, remaining, reset } = await upstashAiRatelimit.limit(identifier);

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());

    if (!success) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: 10 requests per 1 minute limit for AI endpoints.',
      });
      return;
    }
    next();
  } else {
    fallbackAiLimiter(req, res, next);
  }
};

/**
 * Code Execution Rate Limiter Middleware (20 req / 1 min)
 */
export const codeExecLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (upstashCodeRatelimit) {
    const identifier = req.user?.id || req.ip || 'anonymous';
    const { success, limit, remaining, reset } = await upstashCodeRatelimit.limit(identifier);

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());

    if (!success) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: 20 requests per 1 minute limit for code execution.',
      });
      return;
    }
    next();
  } else {
    fallbackCodeLimiter(req, res, next);
  }
};

/**
 * General Rate Limiter Middleware (100 req / 1 min)
 */
export const generalLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (upstashGeneralRatelimit) {
    const identifier = req.user?.id || req.ip || 'anonymous';
    const { success, limit, remaining, reset } = await upstashGeneralRatelimit.limit(identifier);

    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', reset.toString());

    if (!success) {
      res.status(429).json({
        success: false,
        message: 'Rate limit exceeded: 100 requests per 1 minute limit.',
      });
      return;
    }
    next();
  } else {
    fallbackGeneralLimiter(req, res, next);
  }
};

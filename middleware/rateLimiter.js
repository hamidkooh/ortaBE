import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import dotenv from "dotenv";

dotenv.config()

const redisClient = new Redis(process.env.REDIS_URL)

// const redisClient = new Redis({
//     enableOfflineQueue: false, // Prevents commands from being queued while offline
//     url: process.env.REDIS_LOCAL_URL
// });

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'chat_rate_limit', // Prefix for keys in Redis
    points: 2, // n requestss
    duration: 60, // per 60 seconds (1 minute)
    blockDuration: 60 * 1, // Block for 1 minutes if limit is exceeded
});

const chatRateLimiter = (req, res, next) => {

    const consumer = req.user ? req.user.id : req.ip;

    rateLimiter.consume(consumer)
        .then(() => {
            next();
        })
        .catch((rejRes) => {
            const retryAfter = Math.round(rejRes.msBeforeNext / 1000) || 1;
            res.set('Retry-After', retryAfter);
            res.status(429).json({
                error: 'Too many requests.',
                message: `Please try again after ${retryAfter} seconds.`,
            });
        });
};

export default chatRateLimiter;
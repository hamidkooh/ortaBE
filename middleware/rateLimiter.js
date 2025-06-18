import Redis from 'ioredis';
import { createClient } from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import dotenv from "dotenv";

dotenv.config()

const client = new createClient({
    username: 'default',
    password: '1Doxp057KCF5dBTlBfHFbsLHr1B1L14H',
    socket: {
        host: 'redis-14225.c328.europe-west3-1.gce.redns.redis-cloud.com',
        port: 14225
    }
});

// const redisClient = new Redis({
//     enableOfflineQueue: false, // Prevents commands from being queued while offline
//     url: process.env.REDIS_URL
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

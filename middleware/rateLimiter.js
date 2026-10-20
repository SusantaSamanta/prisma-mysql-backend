import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import redis from "../config/redis.js";


export const rateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    limit: 5, // 100 requests per IP 
    standardHeaders: "draft-7",
    legacyHeaders: false,

    store: new RedisStore({
        sendCommand: (...args) => redis.sendCommand(args)
    }),

    message: {
        success: false,
        message: "Too many requests. Please try again later...",
    },
})



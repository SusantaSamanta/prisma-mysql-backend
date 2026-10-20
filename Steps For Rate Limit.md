### Install packages
    npm install express-rate-limit rate-limit-redis redis

### Add Redis credentials to .env
    REDIS_USERNAME=default
    REDIS_PASSWORD=your_actual_password
    REDIS_HOST=hat-cacao-point-61634.db.redis.io
    REDIS_PORT=10803

### Create Redis connection
    Create:
    src/config/redis.js

        const { createClient } = require("redis");

        const redis = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
        });

        redis.on("error", (err) => {
        console.error("Redis Client Error:", err);
        });

        redis.connect();

        module.exports = redis;

### Create the rate limiter
    Create:
    src/middlewares/rateLimiter.js

        const rateLimit = require("express-rate-limit");
        const { RedisStore } = require("rate-limit-redis");
        const redis = require("../config/redis");

        const rateLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // 100 requests per IP
        standardHeaders: "draft-7",
        legacyHeaders: false,

        store: new RedisStore({
            sendCommand: (...args) => redis.sendCommand(args),
        }),

        message: {
            success: false,
            message: "Too many requests. Please try again later.",
        },
        });

        module.exports = rateLimiter;


### Add it to Express Server
    In your main app.js / index.js / server.js:
    const rateLimiter = require("./middlewares/rateLimiter");

    Then:
    app.use("/api", rateLimiter);

    For example:

        const express = require("express");
        const rateLimiter = require("./middlewares/rateLimiter");

        const app = express();

        app.use(express.json());

        app.use("/api", rateLimiter);

        // routes
        app.use("/api/users", userRoutes);
        app.use("/api/books", bookRoutes);
        app.use("/api/donations", donationRoutes);

    Now every request beginning with /api goes through the rate limiter.













# **Short interview/revision questions and answers** 

### Rate Limiter — Quick Q&A

**1. What is rate limiting?**  
Rate limiting controls how many requests a client can make within a specific time period.

**2. Why do we use rate limiting?**  
To prevent abuse, brute-force attacks, excessive API requests, and server overload.

**3. What algorithm does `express-rate-limit` use?**  
The standard setup uses a **fixed-window counter**.

**4. What is a fixed window?**  
A fixed window counts requests within a fixed period, such as **100 requests per 15 minutes**.

**5. Is the limit applied to all users together?**  
No. It is normally applied **per client key**, which by default is the client's IP address.

**6. How does `express-rate-limit` identify a public user?**  
By default, it uses the client's **IP address**. No `userId` is required.

**7. What about a public API where there is no login/user ID?**  
IP-based rate limiting can be used because there is no authenticated `userId`.

**8. Does Express send the IP to Redis automatically?**  
Not exactly. `express-rate-limit` gets the client IP from the Express request and uses it as the rate-limit key. The Redis store stores the counter.

**9. How does Redis store the counter?**  
Conceptually:

```text
rate-limit:103.25.10.5 → 37
rate-limit:103.25.20.8 → 12
```

Each client has its own counter.

**10. How does Redis increase the counter?**

```redis
INCR rate-limit:103.25.10.5
```

If the counter is `37`, it becomes `38`.

**11. How does the counter expire?**

```redis
EXPIRE rate-limit:103.25.10.5 900
```

`900` seconds = **15 minutes**.

**12. Why do we set `EXPIRE`?**  
So the counter automatically disappears when the rate-limit window ends.

**13. Why do we use Redis with multiple servers?**  
Because Redis provides **shared rate-limit storage** for all servers.

```text
Server 1 ──┐
Server 2 ──┼──→ Redis
Server 3 ──┘
```

**14. What happens without shared Redis?**  
Each server could maintain a separate counter, causing inconsistent rate limiting.

**15. What happens when the limit is exceeded?**  
The server returns:

```text
HTTP 429 Too Many Requests
```

**16. Can we rate-limit by user ID instead of IP?**  
Yes. For authenticated users, you can use `userId` as the rate-limit key.

```text
user:101 → 50
user:102 → 20
```

**17. What should we use for unauthenticated/public APIs?**  
Usually **IP-based rate limiting**.

**18. What is the difference between a rate limiter and a load balancer?**

```text
Rate Limiter → Controls how much traffic is allowed.

Load Balancer → Distributes allowed traffic across servers.
```

**19. Can we use both together?**  
Yes.

```text
Client
  ↓
Rate Limiter
  ↓
Load Balancer
  ↓
Server 1 / Server 2 / Server 3
```

**20. Why use `express-rate-limit` instead of writing our own Redis `INCR`/`EXPIRE` middleware?**  
`express-rate-limit` provides a ready-made, maintained rate-limiting implementation, so we don't need to maintain the rate-limit logic ourselves.

**21. Is `express-rate-limit` suitable for production?**  
Yes. For multiple servers, use a shared store such as **Redis/Valkey**.

**22. What is the role of `RedisStore`?**  
It connects `express-rate-limit` with Redis so the rate-limit counters are stored in Redis.

**23. What does `windowMs` mean?**

```js
windowMs: 15 * 60 * 1000
```

It defines the rate-limit window: **15 minutes**.

**24. What does `limit: 100` mean?**

```js
limit: 100
```

A client can make up to **100 requests within that window**.

**25. What happens on request #101?**

```text
100 requests → allowed
101st request → HTTP 429 ❌
```

**26. What is the overall production architecture?**

```text
                Client
                  ↓
            Load Balancer
                  ↓
       ┌──────────┼──────────┐
       ↓          ↓          ↓
    Server 1   Server 2   Server 3
       └──────────┼──────────┘
                  ↓
             Redis/Valkey
          Shared rate-limit data
```

### The 5 things you should remember

> **Algorithm:** Fixed Window  
> **Identifier:** IP by default  
> **Storage:** Redis/Valkey  
> **Exceeded limit:** HTTP 429  
> **Multiple servers:** Shared Redis keeps the counter consistent.
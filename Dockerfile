
FROM node:22-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Install dependencies using the lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy application code, Prisma schema, migrations, and config
COPY . .

# Generate Prisma Client without connecting to the real database
RUN DATABASE_URL="mysql://user:password@localhost:3306/prisma" npx prisma generate

ENV NODE_ENV=production

EXPOSE 3000

# Apply database migrations, then start Express
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]

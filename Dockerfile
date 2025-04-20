FROM oven/bun:latest

WORKDIR /app

# Install OpenSSL - this is the fix for the Prisma error
RUN apt-get update -y && apt-get install -y openssl

# Copy package files
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies with Bun
RUN bun install

# Copy the rest of the application
COPY . .

EXPOSE 7865

CMD ["bun", "server.js"] 
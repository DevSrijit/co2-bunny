FROM oven/bun:latest

WORKDIR /app

# Install OpenSSL and PostgreSQL client - this is the fix for the Prisma error
RUN apt-get update -y && apt-get install -y openssl postgresql-client

# Copy package files
COPY package.json bun.lockb ./
COPY prisma ./prisma/

# Install dependencies with Bun
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy the rest of the application
COPY . .

# Add a script to wait for PostgreSQL to be ready
COPY <<EOF /app/wait-for-postgres.sh
#!/bin/bash
set -e

host="postgres"
port="5432"
user="postgres"
db="co2bunny"

until PGPASSWORD=postgres psql -h "$host" -p "$port" -U "$user" -d "$db" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec "$@"
EOF

RUN chmod +x /app/wait-for-postgres.sh

EXPOSE 7865

CMD /app/wait-for-postgres.sh sh -c "bunx prisma migrate deploy && bun server.js" 
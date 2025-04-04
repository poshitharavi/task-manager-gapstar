#!/bin/sh

# Wait for PostgreSQL
./wait-for.sh postgres:5432 -- echo "PostgreSQL is ready"

# Run migrations
npx prisma db push

# Seed the database
npm run prisma:seed

# Start the application
exec npm run start:prod
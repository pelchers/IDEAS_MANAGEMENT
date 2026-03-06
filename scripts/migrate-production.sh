#!/bin/bash
set -e

echo "========================================"
echo " IDEA-MANAGEMENT — Production Migration"
echo "========================================"
echo ""

# Verify required environment variables
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

if [ -z "$DIRECT_URL" ]; then
  echo "WARNING: DIRECT_URL is not set, using DATABASE_URL for migrations"
  export DIRECT_URL="$DATABASE_URL"
fi

echo "Running production database migrations..."
cd apps/web
npx prisma migrate deploy
echo ""
echo "Migrations complete."
echo ""

echo "Verifying database connection..."
npx prisma db execute --stdin <<< "SELECT 1 AS health_check;"
echo ""
echo "Database connection verified."
echo "========================================"

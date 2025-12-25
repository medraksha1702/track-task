#!/bin/bash

# AMC Migration Runner Script
# This script runs the AMC-related database migrations

# Database connection details (update these with your actual values)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-biomedical_business}"

echo "Running AMC migrations..."
echo "Database: $DB_NAME on $DB_HOST:$DB_PORT"
echo ""

# Run first migration: Create AMC table
echo "1. Creating AMC table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/create_amcs_table.sql

if [ $? -eq 0 ]; then
    echo "✅ AMC table created successfully!"
else
    echo "❌ Failed to create AMC table"
    exit 1
fi

echo ""

# Run second migration: Add amc_id to services
echo "2. Adding amc_id column to services table..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/add_amc_id_to_services.sql

if [ $? -eq 0 ]; then
    echo "✅ amc_id column added successfully!"
else
    echo "❌ Failed to add amc_id column"
    exit 1
fi

echo ""
echo "🎉 All migrations completed successfully!"


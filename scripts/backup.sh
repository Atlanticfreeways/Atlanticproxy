#!/bin/bash

set -e

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME=${POSTGRES_DB:-atlanticproxy}

echo "📦 Starting database backup..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U $POSTGRES_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Database backup completed: db_backup_$DATE.sql.gz"

# Upload to cloud storage (optional)
if [ "$BACKUP_CLOUD" = "true" ]; then
    echo "☁️ Uploading backup to cloud storage..."
    # Add your cloud storage upload command here
    # aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz s3://your-backup-bucket/
fi
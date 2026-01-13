#!/bin/bash
# Clean Logs Script
# Archives *.log files from the logs directory into an archive subdirectory with a timestamp.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOGS_DIR="$PROJECT_ROOT/logs"
ARCHIVE_DIR="$LOGS_DIR/archive"

echo "🧹 Cleaning logs in $LOGS_DIR..."

if [ ! -d "$LOGS_DIR" ]; then
    echo "Logs directory does not exist. Creating it..."
    mkdir -p "$LOGS_DIR"
fi

# Check if there are any log files
count=$(ls -1 "$LOGS_DIR"/*.log 2>/dev/null | wc -l)
if [ "$count" -eq 0 ]; then
    echo "No log files found to archive."
    exit 0
fi

mkdir -p "$ARCHIVE_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_FOLDER="$ARCHIVE_DIR/logs_$TIMESTAMP"
mkdir -p "$ARCHIVE_FOLDER"

mv "$LOGS_DIR"/*.log "$ARCHIVE_FOLDER/"

echo "✅ Archived $count log files to $ARCHIVE_FOLDER"

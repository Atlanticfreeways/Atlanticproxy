#!/bin/bash

# AtlanticProxy V1.5 Stability Test Script
# Purpose: Run the service for an extended period and track resource usage.

DURATION_HOURS=72
LOG_FILE="stability_test.log"
STATS_FILE="resource_usage.csv"
SERVICE_PID=""

echo "Starting AtlanticProxy Stability Test (Duration: ${DURATION_HOURS}h)..."
echo "Timestamp,CPU_%,MEM_MB,Goroutines,FDs" > $STATS_FILE

# Start service in background if not already running
# Assumes 'atlantic-service' is in path or run from build dir
./atlantic-service &
SERVICE_PID=$!

echo "Service started with PID: $SERVICE_PID"

end_time=$((SECONDS + DURATION_HOURS * 3600))

while [ $SECONDS -lt $end_time ]; do
    if ! kill -0 $SERVICE_PID 2>/dev/null; then
        echo "ERROR: Service crashed at $(date)" | tee -a $LOG_FILE
        exit 1
    fi

    # Capture stats (macOS version)
    cpu=$(ps -p $SERVICE_PID -o %cpu | tail -1 | xargs)
    mem=$(ps -p $SERVICE_PID -o rss | tail -1 | awk '{print $1/1024}') # MB
    
    # Optional: If API is up, get goroutines from /metrics (if available)
    goroutines=$(curl -s http://localhost:8080/metrics | grep "go_goroutines" | grep -v "#" | awk '{print $2}')
    
    # Count open FDs (macOS)
    fds=$(lsof -p $SERVICE_PID | wc -l | xargs)

    echo "$(date '+%Y-%m-%d %H:%M:%S'),$cpu,$mem,$goroutines,$fds" >> $STATS_FILE
    
    sleep 60
done

echo "Stability test completed successfully at $(date)"

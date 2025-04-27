#!/bin/bash

# Set content type to JSON
echo "Content-type: application/json"
echo ""

# Create request_queue directory if it doesn't exist
mkdir -p /home/gordon/fillumcropper/request_queue

# Get the current timestamp in the required format
TIMESTAMP=$(date +"%y_%m_%d_%H_%M_%S")

# Create a filename with the timestamp
FILENAME="/home/gordon/fillumcropper/request_queue/${TIMESTAMP}_request.json"

# Read the POST data from stdin
POST_DATA=$(cat)

# Write the POST data to the file
echo "$POST_DATA" > "$FILENAME"

# Check if the file was created successfully
if [ -f "$FILENAME" ]; then
  # Return success response
  echo '{"status":"success","message":"Request queued successfully","filename":"'$TIMESTAMP'_request.json"}'
else
  # Return error response
  echo '{"status":"error","message":"Failed to create request file"}'
fi

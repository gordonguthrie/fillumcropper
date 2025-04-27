#!/bin/bash

# Set content type to JSON
echo "Content-type: application/json"
echo ""

# Directory containing the images
UPLOAD_DIR="/home/gordon/fillumcropper/uploads"

# Ensure the directory exists
if [ ! -d "$UPLOAD_DIR" ]; then
    mkdir -p "$UPLOAD_DIR"
    echo "[]"
    exit 0
fi

# List all image files and output as JSON array
echo "["
first=true
shopt -s nullglob  # Handle case when no files match
for file in "$UPLOAD_DIR"/*.{jpg,jpeg,png,gif,webp,bmp}; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        if [ "$first" = true ]; then
            echo "\"$filename\""
            first=false
        else
            echo ",\"$filename\""
        fi
    fi
done
shopt -u nullglob
echo "]"

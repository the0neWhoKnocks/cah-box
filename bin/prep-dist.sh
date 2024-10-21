#!/bin/sh

# Create required directories
mkdir -p ./dist/server ./dist/public

# Sync Server files, delete anything that doesn't exist anymore
rsync -avh \
  ./src/server \
  ./src/utils \
  ./src/constants.js \
  ./src/data.json \
  ./dist --delete

# Sync Static files
rsync -avh \
  ./src/static/audio \
  ./src/static/imgs \
  ./dist/public --delete

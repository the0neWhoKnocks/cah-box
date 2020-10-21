#!/bin/bash

# Create required directories
mkdir -p ./dist/server ./dist/public

# Sync Server files
rsync -avh \
  ./src/constants.js \
  ./src/data.json \
  ./src/server \
  ./src/utils \
  ./dist --delete

# Sync Static files
rsync -avh \
  ./src/static/audio \
  ./src/static/imgs \
  ./dist/public --delete

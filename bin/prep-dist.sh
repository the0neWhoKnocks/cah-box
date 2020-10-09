#!/bin/bash

echo "[CREATE] Required directories"
mkdir -p ./dist/server ./dist/public

echo "[SYNC] Server files"
rsync -avh \
  ./src/constants.js \
  ./src/data.json \
  ./src/server \
  ./src/utils \
  ./dist --delete

echo "[SYNC] Static files"
rsync -avh \
  ./src/static/imgs \
  ./dist/public --delete

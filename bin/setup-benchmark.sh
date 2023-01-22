#!/usr/bin/env bash

set -e

cd ./test/benchmark

# Tachometer doesn't seem to be able to locate relative files anywhere but the currect directory. So
# move everything we need right here
ln -sf ../../node_modules/emoji-picker-element-data/en/emojibase/data.json ./data.json

for file in index.js picker.js database.js; do
  ln -sf "../../$file" "$file"
done

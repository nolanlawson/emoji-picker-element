#!/usr/bin/env bash

set -e

cd ./test/benchmark

# Tachometer doesn't seem to be able to locate relative files anywhere but the current directory. So
# move every file we need right here.
# See also: https://github.com/google/tachometer/issues/244
ln -sf ../../node_modules/emoji-picker-element-data/en/emojibase/data.json ./data.json

for file in index.js picker.js database.js; do
  ln -sf "../../$file" "$file"
done

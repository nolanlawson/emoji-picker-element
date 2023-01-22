#!/usr/bin/env bash

set -e

cd ./test/benchmark

# have Tachometer host the data.json right here
rm -f ./data.json
ln -s ../../node_modules/emoji-picker-element-data/en/emojibase/data.json ./data.json
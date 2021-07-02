#!/usr/bin/env bash

set -e

cd ./test/benchmark

# fix Tachometer not finding the local dependency using a symlink hack
rm -fr ./node_modules
mkdir ./node_modules
ln -s ../../.. ./node_modules/emoji-picker-element

# have Tachometer host the data.json right here
rm -f ./data.json
ln -s ../../node_modules/emoji-picker-element-data/en/emojibase/data.json ./data.json
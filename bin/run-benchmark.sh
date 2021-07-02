#!/usr/bin/env bash

set -e

./bin/setup-benchmark.sh

cd ./test/benchmark

../../node_modules/.bin/tach --config ./first-load.tachometer.json
../../node_modules/.bin/tach --config ./second-load.tachometer.json


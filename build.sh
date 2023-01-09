#!/bin/sh

mkdir -p dist
cp -f src/index.html dist

npx tsc -noemit
npx esbuild src/main.ts --bundle --outdir=dist

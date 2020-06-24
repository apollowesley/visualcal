#!/bin/bash

pushd renderer
npm install
npm run build
popd

cp src/nodes/package.json dist/nodes
cp src/nodes/*.html dist/nodes
cp -r src/nodes/examples dist/nodes
cp -r src/nodes/icons dist/nodes
cp -r src/nodes/locales dist/nodes

npm run rebuild
npm run release

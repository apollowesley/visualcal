#!/bin/bash

npm run build

cp src/nodes/package.json dist/nodes
cp src/nodes/*.html dist/nodes
cp -R src/nodes/examples dist/nodes
cp -R src/nodes/icons dist/nodes
cp -R src/nodes/locales dist/nodes
#!/bin/bash

pwd

# Build common package
pushd ./common
npm install
npm run build
popd

npm install
# npm run fix-electron-diff-updater
npm run build
npm run copynodes
npm run copydrivers:packagejson
npm run release:publish

# read -p "Press any key to continue ..."

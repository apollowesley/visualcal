#!/bin/bash

pwd

npm install
npm run fix-electron-diff-updater
npm run build
npm run copynodes
npm run copydrivers:packagejson
npm run release:publish

# read -p "Press any key to continue ..."

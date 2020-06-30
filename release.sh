#!/bin/bash

pwd

npm install
npm run build
npm run copynodes
npm run copydrivers:packagejson
npm run release

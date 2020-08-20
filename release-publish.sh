#!/bin/bash

export GH_TOKEN=f6b7c3e2b3640ab7ce711321f797790914a6a51d

pwd

npm install
npm run build
npm run copynodes
npm run copydrivers:packagejson
npm run release:publish

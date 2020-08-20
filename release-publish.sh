#!/bin/bash

export GH_TOKEN=2855e0db150aaad9af00a770c10876c82251ebfc

pwd

npm install
npm run build
npm run copynodes
npm run copydrivers:packagejson
npm run release:publish

#!/bin/bash

export GH_TOKEN=7e7665d94c197095a554d6c6298d18218733c39f

pwd

npm install
npm run build
npm run copynodes
npm run copydrivers:packagejson
npm run release:publish

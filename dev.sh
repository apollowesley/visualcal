#!/bin/bash

rm -rf dist

npm run build

npm run copynodes
npm run copydrivers:packagejson

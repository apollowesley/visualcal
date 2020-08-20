#!/bin/bash

export GH_TOKEN=29b45075dabb493c54dc84d42ddea7586808bab5

pwd

npm install
npm run build
npm run copynodes
npm run copydrivers:packagejson
npm run release:publish

# read -p "Press any key to continue ..."

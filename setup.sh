#!/bin/bash

echo "🗃 Initializing git repository..."

git clone git@github.com:yunionio/dashboard-common.git src
cd src
yarn

cd ..
git clone git@github.com:yunionio/dashboard-module-cloudenv.git containers/Cloudenv
cd containers/Cloudenv
yarn

cd ../..
git clone git@github.com:yunionio/dashboard-module-compute.git containers/Compute
cd containers/Compute
yarn

cd ../..

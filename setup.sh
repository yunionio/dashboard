#!/bin/bash

echo "🗃 Initializing git repository..."

git clone git@github.com:yunionio/dashboard-common.git src
git clone git@github.com:yunionio/dashboard-module-cloudenv.git containers/Cloudenv
git clone git@github.com:yunionio/dashboard-module-compute.git containers/Compute
cd src
yarn
cd ../containers/Compute
yarn
cd ../Cloudenv
yarn
cd ../..

echo "🗃 finished"

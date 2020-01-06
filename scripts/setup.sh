#!/bin/bash

echo "🗃 Initializing git repository..."

DEFAULT_GIT_PREFIX="https://github.com/yunionio"

if [ $DEV_SETUP ]
  then
    read -p "Please enter git prefix: " DEFAULT_GIT_PREFIX
fi
echo $DEFAULT_GIT_PREFIX
if [ ! -d "./src" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-common.git src
fi
if [ ! -d "./containers" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-cloudenv.git containers/Cloudenv
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-compute.git containers/Compute
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-network.git containers/Network
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-dashboard.git containers/Dashboard
fi

echo "🗃 Done"

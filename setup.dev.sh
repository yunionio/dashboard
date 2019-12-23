#!/bin/bash

echo "🗃 Initializing git repository..."

DEFAULT_GIT_PREFIX="https://github.com/yunionio"

if [ $DEV_SETUP ]
  then
    read -p "Please enter git prefix: " DEFAULT_GIT_PREFIX
    read -p "Please enter git upsteam prefix: " DEFAULT_GIT_UPSTREAM_PREFIX
fi
echo "git prefix: "$DEFAULT_GIT_PREFIX
echo "git upsteam prefix: "$DEFAULT_GIT_UPSTREAM_PREFIX

if [ ! -d "./src" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-common.git src
  cd src
  git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-common.git
  cd ../
fi
if [ ! -d "./containers" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-cloudenv.git containers/Cloudenv
  cd containers/Cloudenv
  git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-cloudenv.git
  cd ../..
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-compute.git containers/Compute
  cd containers/Compute
  git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-compute.git
  cd ../..
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-network.git containers/Network
  cd containers/Network
  git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-network.git
  cd ../..
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-dashboard.git containers/Dashboard
  cd containers/Dashboard
  git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-dashboard.git
  cd ../..
fi

echo "🗃 Done"

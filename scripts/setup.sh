#!/bin/bash

echo "🗃 Initializing git repository..."

DEFAULT_GIT_PREFIX="https://github.com/yunionio"

function currentBranch {
  br=`git branch | grep "*"`
  BRANCH=${br/* /}
}

currentBranch

if [ $DEV_SETUP ]
  then
    read -p "Please enter git prefix: " DEFAULT_GIT_PREFIX
fi
echo $DEFAULT_GIT_PREFIX
if [ ! -d "./src" ]; then
  git clone -b $BRANCH $DEFAULT_GIT_PREFIX/dashboard-common.git src
fi
if [ ! -d "./containers" ]; then
  git clone -b $BRANCH $DEFAULT_GIT_PREFIX/dashboard-module-cloudenv.git containers/Cloudenv
  git clone -b $BRANCH $DEFAULT_GIT_PREFIX/dashboard-module-compute.git containers/Compute
  git clone -b $BRANCH $DEFAULT_GIT_PREFIX/dashboard-module-network.git containers/Network
  git clone -b $BRANCH $DEFAULT_GIT_PREFIX/dashboard-module-dashboard.git containers/Dashboard
fi

echo "🗃 Done"

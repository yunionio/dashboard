#!/bin/bash

echo "🗃 Initializing git repository..."

DEFAULT_GIT_PREFIX="https://github.com/yunionio"

if [ $DEV_SETUP ]
  then
    read -p "Please enter git prefix: " DEFAULT_GIT_PREFIX
fi
echo $DEFAULT_GIT_PREFIX

git clone $DEFAULT_GIT_PREFIX/dashboard-common.git src
git clone $DEFAULT_GIT_PREFIX/dashboard-module-cloudenv.git containers/Cloudenv
git clone $DEFAULT_GIT_PREFIX/dashboard-module-compute.git containers/Compute

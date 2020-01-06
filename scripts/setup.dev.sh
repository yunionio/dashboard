#!/bin/bash

# set -x
if [ $DEV_SETUP ]
  then
    read -p "🗃 : 请确保您已经fork了本仓库，并且fork了以下的的仓库(y/n):
    📦 https://github.com/yunionio/dashboard-module-cloudenv
    📦 https://github.com/yunionio/dashboard-module-compute
    📦 https://github.com/yunionio/dashboard-module-network
    📦 https://github.com/yunionio/dashboard-module-dashboard
    " userConfirm
fi

if [ "$userConfirm" == "n" ] 
  then
    echo "请先fork上面👆的仓库之后重试"
    exit 0
fi

DEFAULT_GIT_UPSTREAM_PREFIX="https://github.com/yunionio"
path=$(dirname $0)
cd $path
DEFAULT_GIT_PATH=$(git remote -v |grep origin |awk '{print $2}' | head -1)
DEFAULT_GIT_PREFIX=$(echo $DEFAULT_GIT_PATH | awk -F / '{print $1}')
cd -

echo 'git remote origin:' $DEFAULT_GIT_PREFIX
echo 'git remote upstream:' $DEFAULT_GIT_UPSTREAM_PREFIX

git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard.git

if [ ! -d "./src" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-common.git src
  (
    cd src
    git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-common.git
  )
fi

if [ ! -d "./containers/Cloudenv" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-cloudenv.git containers/Cloudenv
  (
    cd containers/Cloudenv
    git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-cloudenv.git
  )
fi

if [ ! -d "./containers/Compute" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-compute.git containers/Compute
  (
    cd containers/Compute
    git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-compute.git
  )
fi

if [ ! -d "./containers/Network" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-network.git containers/Network
  (
    cd containers/Network
    git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-network.git
  )
fi

if [ ! -d "./containers/Dashboard" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-dashboard.git containers/Dashboard
  (
    cd containers/Dashboard
    git remote add upstream $DEFAULT_GIT_UPSTREAM_PREFIX/dashboard-module-dashboard.git
  )
fi

echo "🗃 Done"

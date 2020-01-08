#!/bin/bash

# set -x
if [ $DEV_SETUP ]
  then
    read -p "🗃 : 请确保您已经fork了本仓库，并且fork了以下的的仓库(y/n):
    📦 ssh://git@git.yunion.io/fep/dashboard-module-common
    📦 ssh://git@git.yunion.io/fep/dashboard-module-cloudenv
    📦 ssh://git@git.yunion.io/fep/dashboard-module-compute
    📦 ssh://git@git.yunion.io/fep/dashboard-module-network
    📦 ssh://git@git.yunion.io/fep/dashboard-module-dashboard
    " userConfirm
fi

if [ "$userConfirm" == "n" ] 
  then
    echo "请先fork上面👆的仓库之后重试"
    exit 0
fi

path=$(dirname $0)
cd $path
DEFAULT_GIT_PATH=$(git remote -v | grep origin | awk '{print $2}' | head -1)
DEFAULT_GIT_PREFIX=$(echo $DEFAULT_GIT_PATH | awk -F / '{print $1}')
cd -

echo 'git remote origin:' $DEFAULT_GIT_PREFIX

if [ ! -d "./src" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-common.git src
fi

if [ ! -d "./containers/Cloudenv" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-cloudenv.git containers/Cloudenv
fi

if [ ! -d "./containers/Compute" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-compute.git containers/Compute
fi

if [ ! -d "./containers/Network" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-network.git containers/Network
fi

if [ ! -d "./containers/Dashboard" ]; then
  git clone $DEFAULT_GIT_PREFIX/dashboard-module-dashboard.git containers/Dashboard
fi

echo "🗃 Done"

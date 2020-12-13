#!/bin/bash

function show_br_commit(){
  local path="$1"; shift
  local branch
  local commit
  local repo
  (
    cd $path
    path=$(readlink -f $path 2>/dev/null || pwd)
    repo=$(basename -s .git `git config --get remote.origin.url`)
    commit=$(git rev-parse --verify HEAD | sed -e "s%^heads/%%" |cut -c 1-8)
    branch=$(git rev-parse --abbrev-ref HEAD |sed -e "s%^heads/%%")
    echo "repo: $repo; branch: $branch; commit: $commit; path: $path"
  )
}

echo "🗃 Initializing git repository..."

DEFAULT_GIT_PREFIX="https://github.com/yunionio"
BRANCH="release/3.0"

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

echo
echo "show branch infor under Dashboard... "
for repo in src containers/*
do
  show_br_commit $repo
done
echo

echo "🗃 Done"

#!/bin/bash

# set -x
# read -p "🗃 : 请确保您已经fork了本仓库，并且fork了以下的的仓库(y/n):
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-common
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-cloudenv
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-compute
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-network
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-dashboard
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-storage
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-k8s
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-helm
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-db
# 📦 ssh://git@git.yunion.io/fep/dashboard-module-monitor
# " userConfirm

# if [ "$userConfirm" == "n" ] 
#   then
#     echo "请先fork上面👆的仓库之后重试"
#     exit -1
# fi

branch=$1
currentPath=$(dirname $0)
checkout(){
  local moduleName=$1; shift
  local path=$1; shift
  { # try
    echo 
    cd $currentPath/$path 
    git fetch && \
    git checkout $branch && \
    # 不显示输出
    cd - 2>&1 >/dev/null && \
    echo "\033[32m [$moduleName] 已切换本地分支 [$branch] \033[0m"
  } || { # catch
    echo "\033[31m [$moduleName] 切换到分支 [$branch] 发生错误，请手动执行 \033[0m"
    exit -1
  }
}

checkout 'dashboard' ../
checkout 'dashboard-module-common' ../src
checkout 'dashboard-module-cloudenv' ../containers/Cloudenv
checkout 'dashboard-module-compute' ../containers/Compute
checkout 'dashboard-module-dashboard' ../containers/Dashboard
checkout 'dashboard-module-network' ../containers/Network
checkout 'dashboard-module-storage' ../containers/Storage
# checkout 'dashboard-module-k8s' ../containers/K8S
# checkout 'dashboard-module-helm' ../containers/Helm
# checkout 'dashboard-module-db' ../containers/DB
checkout 'dashboard-module-monitor' ../containers/Monitor

exit 0

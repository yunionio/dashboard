#!/bin/bash

# set -x
# read -p "ð : è¯·ç¡®ä¿æ¨å·²ç»forkäºæ¬ä»åºï¼å¹¶ä¸forkäºä»¥ä¸ççä»åº(y/n):
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-common
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-cloudenv
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-compute
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-network
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-dashboard
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-storage
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-k8s
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-helm
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-db
# ð¦ ssh://git@git.yunion.io/fep/dashboard-module-monitor
# " userConfirm

# if [ "$userConfirm" == "n" ] 
#   then
#     echo "è¯·åforkä¸é¢ðçä»åºä¹åéè¯"
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
    # ä¸æ¾ç¤ºè¾åº
    cd - 2>&1 >/dev/null && \
    echo "\033[32m [$moduleName] å·²åæ¢æ¬å°åæ¯ [$branch] \033[0m"
  } || { # catch
    echo "\033[31m [$moduleName] åæ¢å°åæ¯ [$branch] åçéè¯¯ï¼è¯·æå¨æ§è¡ \033[0m"
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
checkout 'dashboard-module-k8s' ../containers/K8S
checkout 'dashboard-module-helm' ../containers/Helm
checkout 'dashboard-module-db' ../containers/DB
checkout 'dashboard-module-monitor' ../containers/Monitor

exit 0


#!/bin/bash

# set -x

# 执行 checkout
yarn checkout $@

branch=$1
currentPath=$(dirname $0)
sync(){
  local moduleName=$1; shift
  local path=$1; shift
  { # try
    echo 
    cd $currentPath/$path 
    git fetch origin && \
    git rebase origin/$branch && \
    # 不显示输出
    cd - 2>&1 >/dev/null && \
    echo "\033[32m [$moduleName] rebase 完成 \033[0m"
  } || { # catch
    echo "\033[31m [$moduleName] rebase 发生错误，请手动执行rebase \033[0m"
  }
}

sync 'dashboard' ../
sync 'dashboard-module-common' ../src
sync 'dashboard-module-cloudenv' ../containers/Cloudenv
sync 'dashboard-module-compute' ../containers/Compute
sync 'dashboard-module-dashboard' ../containers/Dashboard
sync 'dashboard-module-network' ../containers/Network
sync 'dashboard-module-storage' ../containers/Storage
# sync 'dashboard-module-k8s' ../containers/K8S
# sync 'dashboard-module-helm' ../containers/Helm
# sync 'dashboard-module-db' ../containers/DB
sync 'dashboard-module-monitor' ../containers/Monitor

exit 0


#!/bin/bash

# set -x
read -p "🗃 : 请确保您已经fork了本仓库，并且fork了以下的的仓库(y/n):
📦 https://github.com/yunionio/dashboard-module-cloudenv
📦 https://github.com/yunionio/dashboard-module-compute
📦 https://github.com/yunionio/dashboard-module-network
📦 https://github.com/yunionio/dashboard-module-dashboard
" userConfirm

if [ "$userConfirm" == "n" ] 
  then
    echo "请先fork上面👆的仓库之后重试"
    exit 0
fi

{ # try
  moduleName='dashboard'
  git fetch upstream && \
  git rebase upstream/master && \
  echo "\033[32m [$moduleName] rebase 完成 \033[0m"
} || { # catch
  echo "\033[31m [$moduleName] rebase 发生错误，请手动执行rebase \033[0m"
}

{ # try
  moduleName='dashboard-module-common'
  cd src
  git fetch upstream && \
  git rebase upstream/master && \
  echo "\033[32m [$moduleName] rebase 完成 \033[0m"
} || { # catch
  echo "\033[31m [$moduleName] rebase 发生错误，请手动执行rebase \033[0m"
}

{ # try
  moduleName='dashboard-module-cloudenv'
  cd ../containers/Cloudenv && \
  git fetch upstream && \
  git rebase upstream/master && \
  echo "\033[32m [$moduleName] rebase 完成 \033[0m"
} || { # catch
  echo "\033[31m [$moduleName] rebase 发生错误，请手动执行rebase \033[0m"
}

{ # try
  moduleName='dashboard-module-compute'
  cd ../Compute && \
  git fetch upstream && \
  git rebase upstream/master && \
  echo "\033[32m [$moduleName] rebase 完成 \033[0m"
} || { # catch
  echo "\033[31m [$moduleName] rebase 发生错误，请手动执行rebase \033[0m"
}

{ # try
  moduleName='dashboard-module-dashboard'
  cd ../Dashboard && \
  git fetch upstream && \
  git rebase upstream/master && \
  echo "\033[32m [$moduleName] rebase 完成 \033[0m"
} || { # catch
  echo "\033[31m [$moduleName] rebase 发生错误，请手动执行rebase \033[0m"
}

{ # try
  moduleName='dashboard-module-network'
  cd ../Network && \
  git fetch upstream && \
  git rebase upstream/master && \
  echo "\033[32m [$moduleName] rebase 完成 \033[0m"
} || { # catch
  echo "\033[31m [$moduleName] rebase 发生错误，请手动执行rebase \033[0m"
}


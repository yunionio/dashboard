# Yunion Dashboard

[![Build Status](https://www.travis-ci.org/yunionio/dashboard.svg?branch=master)](https://www.travis-ci.org/yunionio/dashboard)

Yunion Dashboard 是[YunionCloud](https://github.com/yunionio/yunioncloud)的Web控制台

## 开发指南

### 准备

确保已安装以下软件并将其添加到$PATH变量中：

- Node.js 10.16+ ([用NVM的方式安装](https://github.com/creationix/nvm#usage))
- Yarn 1.19.1+ ([文档](https://classic.yarnpkg.com/en/docs/install))

或者

使用NPM安装Yarn:

```sh
npm install -g yarn
```

Fork以下仓库，然后克隆主仓库并安装依赖

- [dashboard](https://github.com/yunionio/dashboard)

```sh
git clone https://github.com/<owner>/dashboard.git
cd dashboard
yarn
```

根据提示输入仓库的地址前缀, 如: https://github.com/yunionio

注意：如果您在中国大陆，请在运行上面的命令之前执行以下命令，以加快安装速度。

```sh
yarn config set registry https://registry.npm.taobao.org
```

### 启动开发模式

如果要配置代理，请在项目根目录中创建dev.server.config.js并导出配置

配置请根据需求进行更改，以下只是示例

```javascript
// dev.server.config.js
module.exports = {
  open: process.platform === 'darwin',
  port: 8080,
  proxy: {
    '/api': {
      target: 'https://192.168.1.10',
      ws: true,
      changeOrigin: true,
      secure: false,
    },
  },
}
```

[更多配置](https://webpack.js.org/configuration/dev-server/)

```sh
yarn serve
```

使用浏览器打开http://localhost:8080

### 如何编译

```sh
yarn build
```

### 制作 docker 镜像

```bash
REGISTRY=registry.cn-beijing.aliyuncs.com/yunionio TAG=your-tag ./scripts/docker-push.sh
```

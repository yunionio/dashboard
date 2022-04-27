# Cloudpods Dashboard

[![Build Status](https://www.travis-ci.org/yunionio/dashboard.svg?branch=master)](https://www.travis-ci.org/yunionio/dashboard)

[English](./README.md) | [简体中文](./README-CN.md)

Cloudpods Dashboard is the web-based UI for [Cloudpods](https://github.com/yunionio/cloudpods).

## Developer Guide

### Preparation

Make sure the following software is installed and added to the $PATH variable:

- Node.js 10.16+ ([installation with nvm](https://github.com/creationix/nvm#usage))
- Yarn 1.19.1+ ([documentation](https://classic.yarnpkg.com/en/docs/install))

or

Install yarn with npm:

```sh
npm install -g yarn
```

Fork the following repository, then clone dashboard main repository and install dependencies

- [dashboard](https://github.com/yunionio/dashboard)

```sh
$ git clone https://github.com/<owner>/dashboard.git
$ cd dashboard
# Here, depending on your environment, checkout corresponding branch, otherwise you might have incompatibilities
$ git checkout release/3.8
$ yarn
```

Note: If you are in Mainland China, execute the following command before running the command above for faster installation.

```sh
yarn config set registry https://registry.npm.taobao.org
```

### Start Dashboard for development

If you want to configure the proxy, please create dev.server.config.js in the project root directory and export configuration

Please change the configuration according to your needs, the following is just an example

```javascript
// dev.server.config.js
module.exports = {
  open: process.platform === 'darwin',
  port: 8080,
  proxy: {
    '/api': {
      // Be sure to set it to the address of the environment, which is HTTPS
      target: 'https://192.168.1.10',
      ws: true,
      changeOrigin: true,
      secure: false,
    },
  },
}
```

[More configuration](https://webpack.js.org/configuration/dev-server/)

```sh
yarn serve
```

Now, you can open http://localhost:8080 to view

### Build Dashboard for production

```sh
yarn build
```

### Make docker image

```bash
REGISTRY=registry.cn-beijing.aliyuncs.com/yunionio TAG=your-tag ./scripts/docker-push.sh
```

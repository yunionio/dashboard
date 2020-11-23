/**
 * base config
 * author: houjiazong <houjiazong@gmail.com>
 * date: 2019/08/08
 */
const path = require('path')
const fs = require('fs')
const child_process = require('child_process')
const webpack = require('webpack')
const createThemeColorReplacerPlugin = require('./src/config/plugin.config')

const PROXY_TIMEOUT = 1000 * 60 * 2

function resolve (dir) {
  return path.join(__dirname, dir)
}

function fsExistsSync (path) {
  try {
    fs.accessSync(path, fs.F_OK)
  } catch (e) {
    return false
  }
  return true
}

function getModuleList () {
  return fs.readdirSync(resolve('./containers'))
}

const getBuildInfo = () => {
  const getDate = D => `${D.getFullYear() + '-' + (D.getMonth() + 1) + '-' + D.getDate() + ' ' + D.getHours() + ':' + D.getMinutes()}`
  const getCommitMSg = dirPath => {
    const commitDateObj = new Date(child_process.execSync(`cd ${dirPath} && git show -s --format=%cd`).toString())
    const commit = child_process.execSync(`cd ${dirPath} && git show -s --format=%H`).toString().trim()
    const commitUserName = child_process.execSync(`cd ${dirPath} && git show -s --format=%cn`).toString().trim()
    const commitDate = getDate(commitDateObj)
    let head = '-'
    const gitHEAD = path.join(dirPath, '.git/HEAD') // git 最后一次提交的 Head
    if (fsExistsSync(path.resolve(__dirname, gitHEAD))) {
      head = fs.readFileSync(path.resolve(__dirname, gitHEAD), 'utf-8').trim()
    }
    return {
      commit,
      commitUserName,
      commitDate,
      head,
    }
  }
  const nowDate = new Date()
  const buildDate = `${nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate() + ' ' + nowDate.getHours() + ':' + nowDate.getMinutes()}`
  const containers = fs.readdirSync('./containers').filter(item => !/^\..*/.test(item)) // 忽略隐藏文件
  const info = {
    scope: getCommitMSg('./'),
    src: getCommitMSg('./src'),
    buildDate,
  }
  containers.forEach(dir => {
    info[dir] = getCommitMSg(path.join('./containers', dir))
  })
  return info
}

const devServerCoustomConfig = fsExistsSync(resolve('./dev.server.config.js')) ? require('./dev.server.config.js') : {}

module.exports = {
  lintOnSave: process.env.NODE_ENV !== 'production',
  configureWebpack: (config) => {
    config.plugins.push(createThemeColorReplacerPlugin())
    config.plugins.push(new webpack.DefinePlugin({
      themeColor: JSON.stringify(process.env.THEME_COLOR),
      theme: JSON.stringify(process.env.THEME),
    }))
    const aliasSrcDirConfig = {}
    const modules = getModuleList()
    modules.forEach(item => {
      aliasSrcDirConfig[`@${item}`] = resolve(`./containers/${item}`)
    })
    Object.assign(config, {
      resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
          '@': resolve('./src'),
          '~': resolve('./src'),
          '@@': resolve('.'),
          '~~': resolve('.'),
          '@scope': resolve('./scope'),
          ...aliasSrcDirConfig,
        },
      },
    })
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule.include.add(resolve('./src/components/Icon'))
    svgRule
      .test(/\.svg$/)
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'oc-[name]',
      })
    const imagesRule = config.module.rule('images')
    imagesRule.exclude.add(resolve('./src/components/Icon'))
    config.module.rule('images').test(/\.(png|jpe?g|gif|svg)(\?.*)?$/)
    // 设置环境变量
    config.plugin('define').tap((definitions) => {
      definitions[0]['process.env'].VUE_APP_BUILDINFO = JSON.stringify(getBuildInfo())
      definitions[0]['process.env'].THEME_COLOR = JSON.stringify(process.env.THEME_COLOR)
      definitions[0]['process.env'].THEME = JSON.stringify(process.env.THEME)
      definitions[0]['process.env'].BRAND = process.env.BRAND
      return definitions
    })
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  },
  /**
   * 考虑到每个人的配置习惯不同，如有自定义 devServer 配置的需求请在根目录下创建 dev.server.config.js 文件
   * 然后使用 module.exports 导出配置即可，请勿直接修改以下配置 !!
   * dev.server.config.js 不进行 git 提交操作
   */
  devServer: Object.assign({
    overlay: {
      warnings: true,
      errors: true,
    },
    open: process.platform === 'darwin',
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://127.0.0.1:3000',
        ws: true,
        changeOrigin: true,
        proxyTimeout: PROXY_TIMEOUT,
      },
    },
  }, devServerCoustomConfig),
}

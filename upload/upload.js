/* eslint-disable new-cap */
const path = require('path')
const chalk = require('chalk') // 命令行颜色
const ora = require('ora') // 加载流程动画
const shell = require('shelljs') // 执行shell命令
const { NodeSSH } = require('node-ssh') // ssh连接服务器
const inquirer = require('inquirer') // 命令行交互
const zipFile = require('compressing')// 压缩zip
const spinner_style = require('./spinner_style') // 加载动画样式
const CONFIG = require('./config') // 配置

const SSH = new NodeSSH()
let config // 用于保存 inquirer 命令行交互后选择正式|测试版的配置

// logs
const defaultLog = log => console.log(chalk.blue(`---------------- ${log} ----------------`))
const errorLog = log => console.log(chalk.red(`---------------- ${log} ----------------`))
const successLog = log => console.log(chalk.green(`---------------- ${log} ----------------`))

// 文件夹目录
const distDir = path.resolve(__dirname, '../dist') // 待打包
const distZipPath = path.resolve(__dirname, '../dist.zip')

// 项目打包代码 yarn build
const compileDist = async () => {
  const loading = ora(defaultLog('project build start')).start()
  loading.spinner = spinner_style.arrow4
  shell.cd(path.resolve(__dirname, '../'))
  const res = await shell.exec('yarn build') // 执行shell 打包命令
  loading.stop()
  if (res.code === 0) {
    successLog('project build success!')
  } else {
    errorLog('project build error, please try again!')
    process.exit() // 退出流程
  }
}

// 压缩代码
const zipDist = async () => {
  defaultLog('project zip start')
  try {
    await zipFile.zip.compressDir(distDir, distZipPath)
    successLog('project zip success!')
  } catch (error) {
    errorLog(error)
    errorLog('project zip error, exit process!')
    process.exit() // 退出流程
  }
}

// 连接服务器
const connectSSH = async () => {
  const loading = ora(defaultLog('connecting server')).start()
  loading.spinner = spinner_style.arrow4
  try {
    await SSH.connect({
      host: config.SERVER_PATH,
      username: config.SSH_USER,
      password: config.PASSWORD,
    })
    successLog('SSH connect success!')
  } catch (error) {
    errorLog(error)
    errorLog('SSH connect error!')
    process.exit() // 退出流程
  }
  loading.stop()
}

// 线上执行命令
/**
 *
 * @param {String} command 命令操作 如 ls
 */
const runCommand = async (command) => {
  const result = await SSH.exec(command, [], { cwd: config.PATH })
  defaultLog(result)
}

// 清空线上目标目录里的旧文件
const clearOldFile = async () => {
  const commands = ['ls', 'rm -rf *']
  await Promise.all(commands.map(async (it) => {
    return await runCommand(it)
  }))
}

// 传送zip文件到服务器
const uploadZipBySSH = async () => {
  // 连接ssh
  await connectSSH()
  // 线上目标文件清空
  await clearOldFile()
  const loading = ora(defaultLog('prepare to upload files')).start()
  loading.spinner = spinner_style.arrow4
  try {
    await SSH.putFiles([{ local: distZipPath, remote: config.PATH + '/dist.zip' }]) // local 本地 ; remote 服务器 ;
    successLog('upload files success!')
    loading.text = 'unzip file'
    await runCommand('unzip ./dist.zip') // 解压
    await runCommand(`rm -rf ${config.PATH}/dist.zip`) // 解压完删除线上压缩包
    // 将目标目录的dist里面文件移出到目标文件
    await runCommand(`mv -f ${config.PATH}/dist/*  ${config.PATH}`)
    await runCommand(`rm -rf ${config.PATH}/dist`) // 移出后删除 dist 文件夹
    SSH.dispose() // 断开连接
  } catch (error) {
    errorLog(error)
    errorLog('upload failed!')
    process.exit() // 退出流程
  }
  loading.stop()
}

// ------------发布程序---------------
const runUploadTask = async () => {
  console.log(chalk.yellow('--------->  Welcome to MJ 2020 automatic deployment tool  <---------'))
  // 打包
  await compileDist()
  // 压缩
  await zipDist()
  // 连接服务器上传文件
  await uploadZipBySSH()
  successLog('Good luck, successful deployment!')
  process.exit()
}

// 开始前的配置检查
/**
 *
 * @param {Object} conf 配置对象
 */
const checkConfig = (conf) => {
  const checkArr = Object.entries(conf)
  checkArr.map(it => {
    const key = it[0]
    if (key === 'PATH' && conf[key] === '/') { // 上传zip前会清空目标目录内所有文件
      errorLog('PATH cannot be the server root directory!')
      process.exit() // 退出流程
    }
    if (!conf[key]) {
      errorLog(`Configuration ${key} cannot be empty`)
      process.exit() // 退出流程
    }
  })
}

// 执行交互后 启动发布程序
inquirer
  .prompt([{
    type: 'list',
    message: 'Please select publishing environment',
    name: 'env',
    choices: [{
      name: 'development',
      value: 'development',
    }, {
      name: 'production',
      value: 'production',
    }],
  }])
  .then(answers => {
    config = CONFIG[answers.env]
    checkConfig(config) // 检查
    runUploadTask() // 发布
  })

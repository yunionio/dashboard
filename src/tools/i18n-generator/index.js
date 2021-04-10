#!/usr/bin/env node

const program = require('commander')
const generateFile = require('./generate')

program.command('generate [src]')
  .description('对src目录下的vue/js文件进行国际化替换生成, 默认src为执行目录下的src目录')
  .option('-k, --key <key>', '自定义key前缀，默认为相对执行目录的文件路径')
  .option('-i, --index <index>', '开始序列')
  .option('-s, --single <single>', '是否为单文件index序列，默认为全局序列，当自定义key之后，此设置无效')
  .option('-p, --path <path>', '设置生成文件的路径，默认为运行目录（请设置已经存在的目录！！！）')
  .option('-f, --filename <filename>', '设置生成文件名，默认为zh-CN')
  .action((src = 'src', { key = '', single, path = '', filename = 'zh-CN', index }) => {
    generateFile.generate(src, { key, single, path, filename, index })
  })

program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})
if (process.argv.length === 2) {
  program.help()
}

program.parse(process.argv)

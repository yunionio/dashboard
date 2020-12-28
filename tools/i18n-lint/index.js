const fs = require('fs')
const path = require('path')
const process = require('process')
const glob = require('glob')
const R = require('ramda')

const moduleReg = /^.+\/(\w+)\/locales.*$/
const zhReg = /[\u4e00-\u9fa5]/g

const commonLocalesPath = glob.sync(`${path.resolve('src/locales')}/{en.json,zh-CN.json}`)

const containerLocalesPath = glob.sync(`${path.resolve('containers/*/locales')}/{en.json,zh-CN.json}`)

class LintI18n {
  constructor (dirpath) {
    this.dirpath = dirpath
    this.dirname = getDirname(dirpath)
    this.errors = []
    this.diff()
  }

  getFileDetail (path) {
    const file = fs.readFileSync(path).toString()
    const lines = file.split('\n')
    return lines
  }

  diff () {
    const zhLines = this.getFileDetail(`${this.dirpath}/zh-CN.json`)
    const enLines = this.getFileDetail(`${this.dirpath}/en.json`)
    const haZh = zhReg.test(enLines.join('\n'))
    if (zhLines.length !== enLines.length) {
      this.errors.push(`${this.dirname} 目录的多语言文件里的中英文行数不一致，请前往修改`)
    }
    if (haZh) {
      this.errors.push(`${this.dirname} 目录的多语言英文文件里面存在中文，请前往修改`)
    }
  }
}

function getDirname (path) {
  const matchArr = path.match(moduleReg)
  if (matchArr && matchArr.length && matchArr[1]) {
    return matchArr[1]
  }
  return null
}

function getDirpath (path) {
  const arr = path.split('/')
  return arr.slice(0, arr.length - 1).join('/')
}

function groupbyModule () {
  const map = {}
  commonLocalesPath.concat(containerLocalesPath).forEach(path => {
    const dirname = getDirname(path)
    const dirpath = getDirpath(path)
    if (dirname && !map[dirname]) {
      map[dirname] = new LintI18n(dirpath)
    }
  })
  return map
}

const checkI18n = () => {
  const moduleMap = groupbyModule()
  let errors = []
  R.forEachObjIndexed(lintI18n => {
    if (lintI18n.errors.length > 0) {
      errors = errors.concat(lintI18n.errors)
    }
  }, moduleMap)
  if (errors.length) {
    console.error(`${errors.join('\n')}`)
    process.exit(-1)
  }
}

checkI18n()

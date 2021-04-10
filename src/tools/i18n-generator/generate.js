require('colors')
const path = require('path')
const fs = require('fs')
const { getAllFiles } = require('./utils')
let i18nFile
let config = {
  key: '',
  single: false,
}
let generate = 1
let messagesHash = {}
let messages
let rootPath

/**
 * 初始化国际化的消息对象
 */
const initMessage = () => {
  if (fs.existsSync(i18nFile)) {
    try {
      messages = require(i18nFile)
      Object.keys(messages).forEach(key => {
        messagesHash[messages[key]] = key
      })
      // 获取最大的index
      generate = Math.max(...Object.keys(messages).map(item => item.replace(/^[^\d]+/, '') - 0)) || 1
    } catch (e) {
    }
  }
  if (!messages || !Object.keys(messages).length) {
    messages = {}
  }
}
/**
 * 写入国际化消息文件
 */
const writeMessage = () => {
  // 若设置了国际化文件目录，则同时更新所有的国际化文件
  if (config.path) {
    try {
      const localeDir = path.join(process.cwd(), config.path ? config.path : '')
      fs.readdirSync(localeDir).forEach(file => {
        file = path.join(localeDir, file)
        if (file !== i18nFile) {
          const oldMessages = require(file)
          fs.writeFileSync(file, JSON.stringify(Object.assign({}, messages, oldMessages), null, 2), 'utf8')
        }
      })
    } catch (e) {
    }
  }
  fs.writeFileSync(i18nFile, JSON.stringify(messages, null, 2), 'utf8')
}

/**
 * 获取key前缀
 * @param file
 * @returns {string}
 */
const getPreKey = (file) => {
  return config.key ? `${config.key.replace(/[-_]+$/, '')}_` : `${path.relative(rootPath, file).replace(/[\\/\\\\-]/g, '_').replace(/\..*$/, '')}_`
}

/**
 * 获取当前key
 * @returns {*}
 */
const getCurrentKey = (match, file) => {
  if (messagesHash[match]) return messagesHash[match]
  const key = getPreKey(file) + (generate++)
  if (!messages[key]) return key.toLowerCase()
  return getCurrentKey(match, file)
}

const resetIndex = () => {
  // 对于支持单文件index情况，恢复初始index
  if (config.single && !config.key) {
    generate = 1
  }
}

const resetMessageHash = () => {
  // 针对没有设置key的情况，恢复每次文件的messageHash
  if (!config.key) {
    messagesHash = {}
  }
}

/**
 * 替换Vue文件中的需要国际化的部分
 * @param file
 */
const generateVueFile = file => {
  const processFile = path.relative(process.cwd(), file)
  console.log(`🚀 ${processFile.yellow}`.blue)
  resetIndex()
  resetMessageHash()
  let hasReplaced = false
  let content = fs.readFileSync(file, 'utf8')
  // 替换template中的部分
  content = content.replace(/<template(.|\n)*template>/gim, match => {
    match = match.replace(/(["'])`([^`\n]*[\u4e00-\u9fa5]+[^`\n]*)`(['"])/gim, (_, prev, match, after) => {
      match = match.trim()
      let matchIndex = 0
      const matchArr = []
      let result
      match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
        matchArr.push(match)
        return `{${matchIndex++}}`
      })
      const currentKey = getCurrentKey(match, file)
      if (!matchArr.length) {
        result = prev === '"' ? `"$t('${currentKey}')"` : `'$t("${currentKey}")'`
      } else {
        result = prev === '"' ? `"$t('${currentKey}', [${matchArr.toString()}])"` : `'$t("${currentKey}", [${matchArr.toString()}])'`
      }
      messages[currentKey] = match
      messagesHash[match] = currentKey
      hasReplaced = true
      return result
    })
    // 未匹配props中带有'-'的正则
    // /(\w+='|\w+="|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim
    return match.replace(/(\w+='|\w+[-\w+]*="|>|'|")([^'"<>]*[\u4e00-\u9fa5]+[^'"<>]*)(['"<])/gim, (_, prev, match, after) => {
      match = match.trim()
      let result = ''
      let currentKey
      if (match.match(/{{[^{}]+}}/)) {
        // 对于 muscache 中部分的替换
        let matchIndex = 0
        const matchArr = []
        match = match.replace(/{{([^{}]+)}}/gim, (_, match) => {
          matchArr.push(match)
          return `{${matchIndex++}}`
        })
        currentKey = getCurrentKey(match, file)
        if (!matchArr.length) {
          result = `${prev}{{$t('${currentKey}')}}${after}`
        } else {
          result = `${prev}{{$t('${currentKey}', [${matchArr.toString()}])}}${after}`
        }
      } else {
        currentKey = getCurrentKey(match, file)
        if (prev.match(/^\w+[-\w+]*='$/)) {
          // 对于属性中普通文本的替换
          result = `:${prev}$t("${currentKey}")${after}`
        } else if (prev.match(/^\w+[-\w+]*="$/)) {
          // 对于属性中普通文本的替换
          result = `:${prev}$t('${currentKey}')${after}`
        } else if (prev === '"' || prev === '\'') {
          // 对于属性中参数形式中的替换
          result = `$t(${prev}${currentKey}${after})`
        } else {
          // 对于tag标签中的普通文本替换
          result = `${prev}{{$t('${currentKey}')}}${after}`
        }
      }
      messages[currentKey] = match
      messagesHash[match] = currentKey
      hasReplaced = true
      return result
    })
  })
  // 替换script中的部分
  content = content.replace(/<script(.|\n)*script>/gim, match => {
    // 替换注释部分
    const comments = {}
    let commentsIndex = 0
    match = match.replace(/(\/\*(.|\n|\r)*\*\/)|(\/\/.*)/gim, (match, p1, p2, p3, offset, str) => {
      // 排除掉url协议部分
      if (offset > 0 && str[offset - 1] === ':') return match
      const commentsKey = `/*comment_${commentsIndex++}*/`
      comments[commentsKey] = match
      return commentsKey
    })
    match = match.replace(/(['"`])([^'"`\n]*[\u4e00-\u9fa5]+[^'"`\n]*)(['"`])/gim, (_, prev, match, after) => {
      match = match.trim()
      let currentKey
      let result = ''
      if (prev !== '`') {
        // 对于普通字符串的替换
        currentKey = getCurrentKey(match, file)
        result = `this.$t('${currentKey}')`
      } else {
        // 对于 `` 拼接字符串的替换
        let matchIndex = 0
        const matchArr = []
        match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
          matchArr.push(match)
          return `{${matchIndex++}}`
        })
        currentKey = getCurrentKey(match, file)
        if (!matchArr.length) {
          result = `this.$t('${currentKey}')`
        } else {
          result = `this.$t('${currentKey}', [${matchArr.toString()}])`
        }
      }
      messages[currentKey] = match
      messagesHash[match] = currentKey
      hasReplaced = true
      return result
    })
    // 换回注释
    return match.replace(/\/\*comment_\d+\*\//gim, match => {
      return comments[match]
    })
  })
  hasReplaced && fs.writeFileSync(file, content, 'utf-8')
  console.log(`🌔 ${processFile.yellow}`.green)
}

const generateJsFile = (file) => {
  const processFile = path.relative(process.cwd(), file)
  console.log(`🚀 ${processFile.yellow}`.blue)
  resetIndex()
  resetMessageHash()
  let hasReplaced = false
  let content = fs.readFileSync(file, 'utf8')
  // 判断是否已经引入了@/locales， 若没有引入，则在import最后面引入
  /* eslint-disable no-useless-escape */
  const localesMatch = content.match(/(import[\s\t]+([^\s\t]+)[\s\t]+from[\s\t]+'@\/locales'[\s\t]*?)|((let|var|const)[\s\t]+([^\s\t]+)[\s\t]+\=[\s\t]+require\('@\/locales'\)[\s\t]*?)/m)
  if (!localesMatch) {
    const imports = content.match(/from[\s\t]+['"][^'"]+['"][\s\t]*?/gm)
    if (imports) {
      const lastImport = imports[imports.length - 1]
      content = content.replace(lastImport, $ => {
        return `${$}\nimport i18n from '@/locales'`
      })
    } else {
      content = `import i18n from '@/locales'\n${content}`
    }
  }
  // 替换注释部分
  const comments = {}
  let commentsIndex = 0
  content = content.replace(/(\/\*(.|\n|\r)*\*\/)|(\/\/.*)/gim, (match, p1, p2, p3, offset, str) => {
    // 排除掉url协议部分
    if (offset > 0 && str[offset - 1] === ':') return match
    const commentsKey = `/*comment_${commentsIndex++}*/`
    comments[commentsKey] = match
    return commentsKey
  })
  content = content.replace(/(['"`])([^'"`\n]*[\u4e00-\u9fa5]+[^'"`\n]*)(['"`])/gim, (_, prev, match, after) => {
    match = match.trim()
    let currentKey
    let result = ''
    if (prev !== '`') {
      // 对于普通字符串的替换
      currentKey = getCurrentKey(match, file)
      result = `i18n.t('${currentKey}')`
    } else {
      // 对于 `` 拼接字符串的替换
      let matchIndex = 0
      const matchArr = []
      match = match.replace(/(\${)([^{}]+)(})/gim, (_, prev, match) => {
        matchArr.push(match)
        return `{${matchIndex++}}`
      })
      currentKey = getCurrentKey(match, file)
      if (!matchArr.length) {
        result = `i18n.t('${currentKey}')`
      } else {
        result = `i18n.t('${currentKey}', [${matchArr.toString()}])`
      }
    }
    messages[currentKey] = match
    messagesHash[match] = currentKey
    hasReplaced = true
    return result
  })
  // 换回注释部分
  content = content.replace(/\/\*comment_\d+\*\//gim, match => {
    return comments[match]
  })
  hasReplaced && fs.writeFileSync(file, content, 'utf-8')
  console.log(`🌔 ${processFile.yellow}`.green)
}

/**
 * 入口
 * @param src
 * @param options
 */
module.exports.generate = (src, options) => {
  if (!options.key) {
    console.error('请指定 --key 或 -k，如compute'.bgRed)
    return
  }
  if (!options.path) {
    console.error('请指定信息文件生成的路径 --path 或 -p，如./containers/Compute/locales'.bgRed)
    return
  }
  // 初始化序列值
  if (options.index) {
    generate = Number(options.index)
  }
  // 本身路径
  const selfPath = path.resolve(__dirname)
  config = Object.assign(config, options)
  rootPath = path.join(process.cwd(), src)
  const i18nPath = path.join(process.cwd(), options.path ? options.path : '')
  i18nFile = path.join(i18nPath, `${options.filename}.json`)
  const files = getAllFiles(rootPath)
  // 初始化已有国际化消息
  initMessage()
  files.forEach(item => {
    /* eslint-disable no-mixed-operators */
    if (!item.includes(selfPath) && item !== i18nFile && (!config.path || config.path && item.indexOf(i18nPath) < 0)) {
      path.extname(item).toLowerCase() === '.vue' ? generateVueFile(item) : generateJsFile(item)
    }
  })
  writeMessage()
}

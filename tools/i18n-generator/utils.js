const fs = require('fs')
const path = require('path')
/**
 * 获取所有满足需求的文件
 * @param dir
 * @returns {Array}
 */
const getAllFiles = (dir) => {
  const results = []
  fs.readdirSync(dir).forEach(item => {
    item = path.join(dir, item)
    if (fs.lstatSync(item).isDirectory()) {
      results.push(...getAllFiles(item))
    } else {
      if (['.vue', '.js'].indexOf(path.extname(item).toLowerCase()) > -1) {
        results.push(item)
      }
    }
  })
  return results
}

exports.getAllFiles = getAllFiles

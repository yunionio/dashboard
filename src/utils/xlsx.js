import XLSX from 'xlsx'
import * as R from 'ramda'

// 定义某种类型字符串中会包含哪些字符
const strMatchMap = {
  $Bill: ['$', ',', ' ', '.', '-', /\d/],
  '￥Bill': ['￥', ',', ' ', '.', '-', /\d/],
  R$Bill: ['R', '$', ',', ' ', '.', '-', /\d/],
  percent: ['.', '%', ' ', /\d/],
  number: ['.', /\d/],
}

/**
 * 判断字符串中是否只包含某些字符
 * @param {String} str 待判断字符串
 * @param {Array} charList ['$']
 * @returns Boolean
 */
const isOnlyMatchChars = (str, regList) => {
  const list = str.split('')
  let ret = true
  list.map(char => {
    const match = regList.some(reg => {
      if (typeof reg === 'object') {
        return reg.test(char)
      } else {
        return reg === char
      }
    })
    if (!match) {
      ret = false
    }
  })
  return ret
}

/**
 * 拆解匹配不同格式的数据
 * @param {String|Number} data 不同格式的数据 ￥ 100, 50%
 */
const matchDataFormat = (data) => {
  const ret = {
    isBill: false,
    isPercent: false,
    isNumber: false,
    currency: '',
    value: null,
  }
  const d = String(data)
  // 货币
  if (d.startsWith('￥') && isOnlyMatchChars(d, strMatchMap['￥Bill'])) {
    ret.isBill = true
    ret.currency = '￥'
    ret.value = d.replace('￥', '').replaceAll(',', '').replaceAll(' ', '')
  }
  if (d.startsWith('$') && isOnlyMatchChars(d, strMatchMap.$Bill)) {
    ret.isBill = true
    ret.currency = '$'
    ret.value = d.replace('$', '').replaceAll(',', '').replaceAll(' ', '')
  }
  if (d.startsWith('R$') && isOnlyMatchChars(d, strMatchMap.R$Bill)) {
    ret.isBill = true
    ret.currency = 'R$'
    ret.value = d.replace('R$', '').replaceAll(',', '').replaceAll(' ', '')
  }
  // 百分比
  if (d.endsWith('%') && isOnlyMatchChars(d, strMatchMap.percent)) {
    ret.isPercent = true
    ret.value = Number(d.replace('%', '').replaceAll(' ', '')) / 100
  }
  // 数字
  if (isOnlyMatchChars(d, strMatchMap.number) || (d.startsWith('-') && isOnlyMatchChars(d, [...strMatchMap.number, '-']))) {
    ret.isNumber = true
    ret.value = data
  }
  return ret
}

/**
 * 根据下标获取单元格位置
 * @param {Number} col 从0开始，第几列
 * @param {Number} row 从0开始，第几行
 * @returns {String} A2,B1
 */
const getCellSign = (col, row) => {
  const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const L = Math.floor(col / 26) - 1
  const R = col % 26
  return `${L > -1 && L < 26 ? str[L] : ''}${R > -1 && R < 26 ? str[R] : ''}${row + 1}`
}

/**
 * 将格式化后的数据插入worksheet
 * @param {Object} param
 * eg:
 * param: {
 *   data: [['title1', 'title2'], ['value1', 'value2']], 一个sheet包含的数据
 *   t: [{col: 0, row: 0, value: 'n'}], 指定单元格格式：A1 指定为数字
 *   z: [{col: 0, row: 1, value: '$#,##0.00'}], 指定单元格格式化字符串：A2 指定为美元货币
 *   ignoreColsIndex: [0, 1], 忽略哪些列不进行格式化
 * }
 * @returns ws
 */
export const addDataToSheetAfterFormat = ({ data: originData = [], titleRowLen = 1, t = [], z = [], ignoreColsIndex = [] } = {}) => {
  const data = R.clone(originData)
  const formatObj = {}
  if (t.length || z.length) {
    // 只针对指定的单元格进行格式化

  } else {
    // 未指定要格式化的单元格，开始除标题外自动分析
    data.map((row, index) => {
      if (index > titleRowLen - 1) {
        row.map((col, index2) => {
          const fData = matchDataFormat(col)
          const cellSign = getCellSign(index2, index)
          if (!ignoreColsIndex.includes(index2)) {
            if (fData.isBill) {
              formatObj[cellSign] = formatObj[cellSign] || {}
              formatObj[cellSign].t = 'n' // 数字格式
              formatObj[cellSign].z = `${fData.currency} #,##0.00` // 货币format
              data[index][index2] = fData.value
            }
            if (fData.isPercent) {
              formatObj[cellSign] = formatObj[cellSign] || {}
              formatObj[cellSign].t = 'n' // 数字格式
              formatObj[cellSign].z = '0.00%' // 百分比format
              data[index][index2] = fData.value
            }
            if (fData.isNumber) {
              formatObj[cellSign] = formatObj[cellSign] || {}
              formatObj[cellSign].t = 'n' // 数字格式
              data[index][index2] = fData.value
            }
          }
        })
      }
    })
  }
  // 添加单元格格式至ws
  const ws = XLSX.utils.aoa_to_sheet(data)
  for (const cellSign in formatObj) {
    for (const key in formatObj[cellSign]) {
      ws[cellSign][key] = formatObj[cellSign][key]
    }
  }
  return ws
}

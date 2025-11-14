import * as R from 'ramda'
import moment from 'moment'
import _ from 'lodash'
import i18n from '@/locales'
import { numerify } from '@/filters'
import setting from '@/config/setting'

import { getLanguage } from '@/utils/common/cookie'
// import { encodeURI } from 'js-base64'

let tIndex = 0

export const UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

/**
 * 驼峰式 拆分为 词语数组
 * @param {String} camel methodsName
 * @returns ['methods', 'name']
 */
export function camel2Words (camel) {
  let tmp = ''
  for (let i = 0; i < camel.length; i++) {
    const ch = camel.charAt(i)
    if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) {
      if (tmp.length > 0) {
        tmp += '-'
      }
      tmp += ch.toLowerCase()
    } else {
      tmp += ch
    }
  }
  return tmp.split('-')
}

/**
 * 获取指定长度的uuid
 * @param {Number} len uuid长度
 * @param {Number} radix 进制
 * @returns '612D0EF0-7017-40FE-9A3A-2A880BBA02FB'
 */
export function uuid (len, radix) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  const uuid = []
  let i
  radix = radix || chars.length
  if (len) {
    for (i = 0; i < len; i++) {
      uuid[i] = chars[0 | Math.random() * radix]
    }
  } else {
    let r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

class Sizestr {
  sizestr (sz, unit, base, precision = 2, end = UNITS[UNITS.length - 1]) {
    if (!sz) return '0B'
    const nsz = this.normalizeSize(sz, unit, base)
    if (nsz < base) {
      return '' + nsz
    }
    let nbase = base
    if (end === UNITS[0]) {
      return '' + sz + UNITS[0]
    }
    for (let i = 1; i < UNITS.length; i++) {
      nbase *= base
      if (nsz < nbase || UNITS[i] === end) {
        return '' + this.round(nsz * base / nbase, precision) + UNITS[i]
      }
    }
    return 'NaN'
  }

  // 在 sizestr 上加上 B 结尾
  sizestrWithUnit (...args) {
    const res = this.sizestr(...args)
    const letterReg = /[A-Z]/g
    if (res.startsWith('NaN') || res === '0B') return '0 B'
    if (res.endsWith('B')) return res.slice(0, -1) + ' B'
    if (!letterReg.test(res)) return `${res} B`
    const reg = /(\d+\.?\d*)([A-Z])/ // 12T 1.5G
    const matched = res.match(reg) // ['111T', '111', 'T']
    return `${matched[1]} ${matched[2]}B`
  }

  /**
   * 按照固定单位进行大小转换
   * @param {Number} sz 原来大小
   * @param {String} originUnit 原来单位，取值UNITS中
   * @param {String} targetUnit 目标单位，取值UNITS中
   * @param {Number}} base 单位之间进制
   * @param {Boolean} withUnit 返回是否带单位
   * @param {Number} precision 返回精度
   * @param {Array} units 单位列表，从小到大
   * @returns {Number|String} 234 | 234 KB
   */
  // 数值过小时展示为 < 0.01 MB
  sizeToDesignatedUnit (sz, originUnit, targetUnit, base = 1024, withUnit = true, precision = 2, units = UNITS) {
    if (!sz) return withUnit ? `0 ${targetUnit === 'B' ? 'B' : targetUnit + 'B'}` : 0
    const nsz = this.normalizeSize(sz, originUnit, base)
    let nbase = base
    for (let i = 1; i < UNITS.length; i++) {
      nbase *= base
      if (UNITS[i] === targetUnit) {
        const ret = this.round(nsz * base / nbase, precision)
        return withUnit ? `${sz && !ret ? '<0.01' : ret} ${targetUnit === 'B' ? 'B' : targetUnit + 'B'}` : (sz && !ret ? '<0.01' : ret)
      }
    }
    return 'NaN B'
  }

  unitBase (unit, base) {
    if (!unit) {
      return base
    }
    let unitbase = 1
    for (let i = 0; i < UNITS.length; i++) {
      if (unit.toUpperCase() === UNITS[i]) {
        return unitbase
      }
      unitbase *= base
    }
    return Math.NaN
  }

  normalizeSize (sz, unit, base) {
    return sz * this.unitBase(unit, base)
  }

  numScale (num) {
    if (parseInt(num) === 0) {
      return 0
    }
    if (num < 0) {
      num = -num
    }
    let width = 0
    while (num >= 1.0) {
      num = num / 10.0
      width += 1
    }
    while (num < 0.1) {
      num = num * 10.0
      width -= 1
    }
    return width
  }

  round (num, bits) {
    const scale = this.numScale(num)
    if (scale > bits) {
      bits = 0
    } else {
      bits -= scale
    }
    let base = 1
    for (let i = 0; i < bits; i++) {
      base *= 10
    }
    return Math.floor(num * base + 0.5) / base
  }

  percentStr (val) {
    return '' + this.round(val * 100, 0) + '%'
  }
}
const sizestrInstance = new Sizestr()

export const sizestr = sizestrInstance.sizestr.bind(sizestrInstance) // -> 12G  4.5T
export const sizestrWithUnit = sizestrInstance.sizestrWithUnit.bind(sizestrInstance) // -> 12 GB   4.5 TB
export const sizeToDesignatedUnit = sizestrInstance.sizeToDesignatedUnit.bind(sizestrInstance) // -> 12 GB   4.5 TB
export const percentstr = sizestrInstance.percentStr.bind(sizestrInstance)

/**
 * 对象数组转对象
 * @param {Array} arr 具有相同key不同value的对象数组 [{id:1, name:'x'}, {id:2, name:'y'}]
 * @param {String} itemKey='id'
 * @returns {Object} {1: {id:1, name:'x'}, 2: {id:2, name:'y'}}
 */
export const arrayToObj = (arr, itemKey = 'id') => {
  const obj = {}
  arr.forEach(item => {
    obj[item[itemKey]] = item
  })
  return obj
}

/**
 * 元素转数组
 * @param {any} 任意输入
 * @returns {Array}
 * @example
 * changeToArr(null) // 返回 [null]
 * changeToArr([1])  // 返回 [1]
 */
export const changeToArr = R.unless(
  R.is(Array),
  R.of,
)

/**
 * 判断是否为Chrome浏览器
 * @returns {Boolean}
 */
export function isChrome () {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
}

export function download (data, filename = 'download', mime = 'application/octet-stream', bom) {
  const blobData = (typeof bom !== 'undefined') ? [bom, data] : [data]
  const blob = new Blob(blobData, { type: mime })

  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    window.navigator.msSaveBlob(blob, filename)
  } else {
    const blobURL = window.URL.createObjectURL(blob)
    const tempLink = document.createElement('a')
    tempLink.style.display = 'none'
    tempLink.href = blobURL
    tempLink.setAttribute('download', filename)

    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank')
    }
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
    window.URL.revokeObjectURL(blobURL)
  }
}

/**
 * @description 限制文字最大长度
 * @param {String} text 文字内容
 * @param {Number} maxLen 限制的最大长度
 * @returns {String} text
 */
export const maxTextLength = (text, maxLen) => {
  if (text && text.length > maxLen) {
    return text.substr(0, maxLen) + '...'
  } else {
    return text
  }
}

/**
 * @description 将数组变为对象，[{id: 'name', value: 'xx'}, {id: 'server', value: 'xc'}] => {name: {id: 'name', value: 'xx'}, server:{id: 'server', value: 'xc'}}
 * @param {Array} arr
 * @param {String} key
 * @param {String} itemKey
 */
export const arrToObjByKey = (arr, key, cb) => {
  const target = {}
  arr.reduce((obj, item, i) => {
    if (R.is(Function, cb)) {
      obj[item[key]] = cb(item, i)
    } else {
      obj[item[key]] = { data: item }
    }
    return obj
  }, target)
  return target
}

/**
 * 解析 influxdb 数据，主要把 series.values 的数据单位缩进
 * @param {Object} series 结构如下：
 * @param {Array} series.columns 列
 * @param {String} series.name 名称
 * @param {Array} series.values 二维数组，表示每列的数据
 */
export const autoComputeUnit = (series, sourceUnit = 'bps', base = 1000, seleteItem) => { // 单位自动缩进
  let points = series.points
  let unit = 'b'
  const timeColumnIndex = series.columns.findIndex(val => val === 'time') || 1
  const deleteTimeValues = points.map(arr => arr.slice(0, timeColumnIndex))
  let valueArr = deleteTimeValues.reduce((a, b) => a.concat(b))
  valueArr = valueArr.filter(val => val) // 过滤掉 0
  const maxValue = Math.max.apply(null, valueArr)
  if (maxValue >= base && valueArr && valueArr.length > 0) {
    const maxValueStr = sizestr(maxValue, sourceUnit.charAt(0), base)
    unit = maxValueStr.slice(-1) // 'B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'
    const originIndex = UNITS.findIndex(val => val === sourceUnit.charAt(0).toUpperCase())
    let targetIndex = UNITS.findIndex(val => val === unit.charAt(0))
    targetIndex = targetIndex < 0 ? 0 : targetIndex
    const scaleLen = targetIndex - originIndex
    const scale = Math.pow(base, scaleLen)
    points = points.map(arr => {
      return arr.map((item, i) => {
        if (i === timeColumnIndex) { // time
          return item
        }
        return item / scale
      })
    })
  }
  if (unit.toLowerCase() === 'b') {
    unit = 'b'
  } else if (['bps_recv', 'bps_sent'].includes(seleteItem)) {
    unit += 'b'
  } else {
    unit += 'B'
  }
  if (sourceUnit === 'bps') unit += '/s'
  return { // 主要作用是 改变 values(单位缩进), 加入当前单位 unit
    ...series,
    points,
    unit,
  }
}

/**
 * @description 美化作用：把 【133Bps】 这种字符串分离成 【133 Bps】
 * @param {String} value 要分离单位的字符串，如：11Kbps
 * @returns {String} 返回分离后的结果，如：11 Kbps
 */
export const splitUnit = value => {
  const reg = /^(\d+\.?\d?)([a-zA-Z]+|%)/
  value = String(value)
  const groupsArr = value.match(reg)
  if (groupsArr && groupsArr.length >= 3) {
    const num = groupsArr[1]
    let unit = groupsArr[2]
    if (num === '0' || num === 0) { // 0M => 0B
      if (UNITS.includes(unit)) unit = UNITS[0]
    }
    return {
      text: `${num} ${unit}`,
      value: num,
      unit,
    }
  }
  return {
    text: value,
    value,
    unit: '',
  }
}

/**
 * 对象继承
 * @param {Object} to
 * @param {Object} _from
 * @returns {Object}
 * @example extend({name:'x'}, {age:18}) -> {name:'x', age:18}
 */
function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
};

/**
 * 对象数组合并为对象 [{name: 'x'}, {age: 18}] -> {name: 'x', age: 18}
 * @param {Array}
 * @returns {Object}
 */
export function toObject (arr) {
  var res = {}
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      extend(res, arr[i])
    }
  }
  return res
};

// 在 sizestr 上加上 B 结尾
export function sizestrC (...args) {
  const res = sizestr(...args)
  const letterReg = /[A-Z]/g
  if (res.startsWith('NaN') || res === '0B') return '0 B'
  if (res.endsWith('B')) return res.slice(0, -1) + ' B'
  if (!letterReg.test(res)) return `${res} B`
  const reg = /(\d+\.?\d*)([A-Z])/ // 12T 1.5G
  const matched = res.match(reg) // ['111T', '111', 'T']
  return `${matched[1]} ${matched[2]}B`
}

/**
 * @description 找到数组某一项并提前到第一项
 * @param {Array} arr
 * @param {Function} condition 满足找到目标值的条件函数
 */
export const findAndUnshift = (arr, condition) => {
  const ret = arr.slice(0)
  if (!condition || !R.is(Function, condition)) return ret
  let firstValue
  for (var i = 0; i < ret.length; i++) {
    if (condition(ret[i])) {
      firstValue = ret[i]
      ret.splice(i, 1)
      break
    }
  }
  if (firstValue) {
    ret.unshift(firstValue)
  }
  return ret
}

/**
 * @description 找到数组某一项并提前到最后一项
 * @param {Array} arr
 * @param {Function} condition 满足找到目标值的条件函数
 */
export const findAndPush = (arr, condition) => {
  const ret = arr.slice(0)
  if (!condition || !R.is(Function, condition)) return ret
  if (!ret || R.type(arr) !== 'Array' || ret.length === 0) return ret
  let firstValue
  for (var i = 0; i < ret.length; i++) {
    if (condition(ret[i])) {
      firstValue = ret[i]
      ret.splice(i, 1)
      break
    }
  }
  if (firstValue) {
    ret.push(firstValue)
  }
  return ret
}

export const i18nSetProperty = ({
  obj,
  key,
  i18nKey,
  props,
  perfix = '',
  suffix = '',
}) => {
  Object.defineProperty(obj, key, {
    ...props,
    enumerable: true,
    get () {
      return `${perfix}${i18n.t(i18nKey)}${suffix}`
    },
  })
}

export const getRequestT = () => {
  return ++tIndex
}

export const formatSeconds = value => {
  let theTime = parseInt(value) // 需要转换的时间秒
  let theTime1 = 0 // 分
  let theTime2 = 0 // 小时
  let theTime3 = 0 // 天
  let theTime4 = 0 // 月
  let theTime5 = 0 // 年
  if (theTime >= 60) {
    theTime1 = parseInt(theTime / 60)
    theTime = parseInt(theTime % 60)
    if (theTime1 >= 60) {
      theTime2 = parseInt(theTime1 / 60)
      theTime1 = parseInt(theTime1 % 60)
      if (theTime2 >= 24) {
        // 大于24小时
        theTime3 = parseInt(theTime2 / 24)
        theTime2 = parseInt(theTime2 % 24)
        // 大于30天
        if (theTime3 >= 30) {
          theTime4 = parseInt(theTime3 / 30)
          theTime3 = parseInt(theTime3 % 30)
          // 大于12月
          if (theTime4 >= 12) {
            theTime5 = parseInt(theTime4 / 12)
            theTime4 = parseInt(theTime4 % 12)
          }
        }
      }
    }
  }
  let str = ''
  const obj = {
    seconds: theTime,
    minutes: theTime1,
    hours: theTime2,
    days: theTime3,
    months: theTime4,
    years: theTime5,
  }
  const arr = [
    [theTime5, 'years'],
    [theTime4, 'months'],
    [theTime3, 'days'],
    [theTime2, 'hours'],
    [theTime1, 'minutes'],
    [theTime, 'seconds'],
  ]
  if (theTime > 0) {
    str = i18n.t('common.date.seconds', [parseInt(theTime)])
  }
  if (theTime1 > 0) {
    str = i18n.t('common.date.minutes', [parseInt(theTime1)])
  }
  if (theTime2 > 0) {
    str = i18n.t('common.date.hours', [parseInt(theTime2)])
  }
  if (theTime3 > 0) {
    str = i18n.t('common.date.days', [parseInt(theTime3)])
  }
  if (theTime4 > 0) {
    str = i18n.t('common.date.months', [parseInt(theTime4)])
  }
  if (theTime5 > 0) {
    str = i18n.t('common.date.years', [parseInt(theTime5)])
  }
  return {
    str,
    obj,
    arr,
  }
}

/**
 * @description 配合 <a-auto-complete /> 使用
 * @param {Object} obj e.g. { a: { a1: { b: 'bbb', c: 'ccc' } } }
 * @param {String} path e.g. a.a1
 * @returns e.g. ['a.a1.b', 'a.a1.c']
 */
export const objAutoComplete = (obj, path) => {
  if (R.isEmpty(obj) || !path) return []
  const _genObjKeys = (resObj, objKeyPath, prefixPath = '') => {
    const keys = Object.keys(resObj).map(val => prefixPath + val)
    const opts = keys.filter(val => val.toLowerCase().includes(objKeyPath.toLowerCase()))
    return opts
  }
  const objKeys = path.split('.')
  if (objKeys.length === 1) {
    return _genObjKeys(obj, path)
  } else if (objKeys.length > 1) {
    const dropLastArr = R.dropLast(1, objKeys)
    const lastPath = R.last(objKeys)
    const readyPath = dropLastArr.join('.')
    const readyValue = _.get(obj, readyPath)
    if (readyValue && R.is(Object, readyValue)) {
      return _genObjKeys(readyValue, lastPath, `${readyPath}.`)
    }
    return []
  }
}

/**
 * [过滤对象]
 * @param Function 过滤函数
 * @param Object 被过滤对象
 */
export const filterObj = (fn, obj) => {
  if (!R.is(Function, fn) || !R.is(Object, obj)) {
    throw new Error('filterObj 参数格式不正确')
  }
  const result = {}
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      const val = obj[k]
      if (fn(val, k)) {
        result[k] = val
      }
    }
  }
  return result
}

/**
 * [城市code中文映射]
 * @param cities 城市list
 * @param val 被映射的城市code
 */
export const cityMap = (cities, val) => {
  let result = ''
  if (val) {
    const valPrefix = val.slice(0, 3)
    cities.map(item => {
      const itemPrefix = item.value.slice(0, 3)
      if (valPrefix === itemPrefix && item.children && item.children.length) {
        item.children.map(chilItem => {
          if (val === chilItem.value) {
            result = item.label + chilItem.label
          }
        })
      }
    })
  }
  return result
}

export const genReferRouteQuery = (route) => {
  const query = {
    pathAuthPage: route.meta.authPage,
    pathAuth: route.meta.auth || true,
    path: route.path,
  }
  if (!R.isNil(route.query) && !R.isEmpty(route.query)) {
    query.pathQuery = JSON.stringify(route.query)
  }
  return query
}

/**
 * [月份/年补全日期/月份]
 * @param {Array} data 原始数据
 * @param {Date} currentMonth 当前时间
 * @param {Array} keys 待补0的字段
 * eg: [{ time: 07-01, value: 21 }, ... { time: 07-16, value: 35 }] => [{ time: 07-01, value: 21 }, ... { time: 07-31, value: 45 }]
 */
export const completionDate = (data, currentMonth, keys = [], monthInYear) => {
  if (data.length === 0) return []
  const result = []
  const maxDay = monthInYear ? 12 : moment(currentMonth).daysInMonth()
  const momentFormat = monthInYear ? 'YYYY' : 'MM'
  var maxOffset = 0
  for (let i = 1; i <= maxDay; i++) {
    let day = 1
    let obj = {}
    if (i < 10) {
      day = '0' + i
    } else {
      day = i + ''
    }
    for (let j = 0; j < data.length; j++) {
      const dataItemDay = data[j].time.substring(data[j].time.length - 2)
      if (day === dataItemDay) {
        maxOffset = j + 1
        obj = data[j]
        obj = {
          ...obj,
          time: moment(currentMonth).format(momentFormat) + '-' + day,
        }
        break
      } else {
        obj = {
          time: moment(currentMonth).format(momentFormat) + '-' + day,
        }
      }
    }
    keys.map(item => {
      if (!obj[item]) {
        obj[item] = 0
      }
    })
    result.push(obj)
  }
  if (maxOffset < data.length) {
    for (let j = maxOffset; j < data.length; j++) {
      result.push(data[j])
    }
  }
  return result
}

/*
 * 去除对象中所有符合条件的对象，默认是去除对象属性为空值
 * @param {Object} obj 来源对象
 * @param {Function} fn 函数验证每个字段
 * e.g. { a: '', b: 123, c: { d: 1, e: {}} } => { b: 123, c: { d: 1 } }
 */
export const compactObj = (obj, fn = R.isEmpty) => {
  const newObj = _.cloneDeep(obj)
  for (var i in newObj) {
    if (typeof newObj[i] === 'object') {
      compactObj(newObj[i], fn)
    }
    if (fn(newObj[i])) {
      delete newObj[i]
    }
  }
  return newObj
}

/*
 * 去除对象中所有符合条件的对象，默认是去除对象属性为空值
 * @param {String|Number} value
 * @param {String} unit e.g: '%', 'bps', 'Mbps', 'Bps', 'cps', 'count', 'ms', 'byte'
 * @param {Number} base
 * @return {Object} e.g: { text: '123 MB', value: '123', unit: 'MB'  }
 */
export const transformUnit = (value, originUnit = '', base = 1000, numerifyFormat = '0.00') => {
  const unit = originUnit === 'NULL' ? '' : originUnit
  const number = Number(value)
  const valueStr = parseFloat(numerify(number, numerifyFormat))
  if (!R.is(Number, number) || Number.isNaN(number)) {
    console.error('onecloud: value must be Number type by used transformUnit util')
    return { text: '0', value: 0, unit: '' }
  }
  let obj = {
    text: `${valueStr} ${unit}`,
    value: valueStr,
    unit,
  }
  if (~UNITS.indexOf(unit)) {
    obj = splitUnit(sizestr(value, unit, base))
  } else if (unit.toLowerCase().endsWith('bps')) { // bps、Mbps、Bps
    let sizestrUnit = 'B'
    let base = 1000
    let b = 'b'
    if (unit.indexOf('bps') === 1) { // Mbps
      sizestrUnit = unit.replace(/bps/, '') // M
    }
    if (unit === 'Bps') {
      base = 1024
      b = 'B'
    }
    obj = splitUnit(sizestr(value, sizestrUnit, base))
    // 使用 numerifyFormat 格式化数值
    const numValue = parseFloat(obj.value)
    const formattedValue = parseFloat(numerify(numValue, numerifyFormat))
    obj.value = formattedValue
    // 替换 text 中的数值部分为格式化后的值
    const textMatch = obj.text.match(/^(\d+\.?\d*)\s*(.*)$/)
    if (textMatch) {
      const originalUnit = textMatch[2]
      if (obj.text.endsWith('B')) {
        obj.text = `${formattedValue} ${b}ps`
      } else {
        obj.text = `${formattedValue} ${originalUnit}${b}ps`
      }
    } else {
      // 如果匹配失败，使用原来的逻辑
      if (obj.text.endsWith('B')) {
        obj.text = `${formattedValue} ${b}ps`
      } else {
        obj.text += `${b}ps`
      }
    }
  } else if (unit === 'byte') {
    obj = splitUnit(sizestr(value, 'B', 1024))
    if (!obj.text.endsWith('B')) {
      obj.text += 'B'
    }
  } else if (~unit.indexOf('ms')) {
    const text = numerify(number, unit)
    obj.text = text
  }
  return obj
}

/**
 * 统计每个元素出现次数
 * @param {Array<String>} arr 要统计的元素数组
 */
export const uniqueOccurrences = (arr) => {
  const obj = {} // 新建对象存储每个元素和出现的次数

  for (let i = 0; i < arr.length; i++) {
    if (!obj[arr[i]]) {
      obj[arr[i]] = 1
    } else {
      obj[arr[i]]++
    }
  }
  return obj
}

/**
 * 校验密码强度
 * 数字、大小写字母、特殊字符
 * 包含一种：返回1
 * 包含二种：返回2
 * 包含三种：返回3
 * 包含四种：返回4
 * @param {String} password
 * @returns {Number}
 */
export const passwordLevel = (password) => {
  let Modes = 0
  for (let i = 0; i < password.length; i++) {
    Modes |= CharMode(password.charCodeAt(i))
  }
  return bitTotal(Modes)

  // CharMode函数
  function CharMode (iN) {
    // 数字
    if (iN >= 48 && iN <= 57) { return 1 }
    // 大写字母
    if (iN >= 65 && iN <= 90) { return 2 }
    // 大小写
    if ((iN >= 97 && iN <= 122) || (iN >= 65 && iN <= 90)) {
      return 4
    } else {
      // 特殊字符
      return 8
    }
  }

  // bitTotal函数
  function bitTotal (num) {
    let modes = 0
    for (let i = 0; i < 4; i++) {
      if (num & 1) modes++
      num >>>= 1
    }
    return modes
  }
}

/**
 * 四舍五入保留n位小数，e.g: 12.343 -> 12.34
 * @param {String|Number} num 数值
 * @param {String} precision 小数点后有效位数
 * @param {Boolean} needFixZero 不够有效位数是否补0
 * @returns {Number}
 */
export const mathRoundFix = (num, precision = 2, needFixZero) => {
  if (!num) return '0'
  const multiple = Math.pow(10, precision) // 倍数
  const n = Math.round(num * multiple) / multiple
  let res = n.toFixed(precision)
  if (!needFixZero) res = parseFloat(res)
  return res
}
// 中文文档较全，默认使用中文文档
export const language = getLanguage() === 'en' ? 'en' : 'zh'

export function isCE () {
  return !process.env.VUE_APP_IS_PRIVATE
}

export function isSAAS () {
  return !!process.env.VUE_APP_IS_SAAS
}

export function getDocsUrl (scope, isSysCE) {
  let prefix = 'docs'
  const useCe = isCE() || isSysCE
  if (useCe) {
    return `https://www.cloudpods.org/${language === 'en' ? 'en/' : ''}${prefix}/`
  }
  if (scope === 'domain' || scope === 'project') {
    prefix = prefix + '/domain'
  }
  return `${window.location.origin}/${prefix}/${language}/docs/`
}

export function genDocsUrl ({ scope, isSysCE, cePath, eePath, anchor = '' }) {
  const useCe = isCE() || isSysCE
  return getDocsUrl(scope, isSysCE) + (useCe ? cePath : eePath) + anchor
}

/**
 * search string to query map
 * @param {String} queryString a search string
 */
export function decodeQuery (queryString) {
  var query = {}
  var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&')
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

/**
 * query map to search string
 * @param {Map} query a query oibject
 */
export function encodeQuery (query) {
  var search = ''
  for (var k in query) {
    if (search.length === 0) {
      search = '?'
    } else {
      search += '&'
    }
    search += encodeURIComponent(k) + '=' + encodeURIComponent(query[k])
  }
  return search
}

/**
 * remove specific keys from a query search
 * @param {*} search a search string
 * @param {*} keys the key to remove
 */
export function removeQueryKeys (search, keys) {
  const query = decodeQuery(search)
  for (var i = 0; i < keys.length; i++) {
    if (query[keys[i]]) {
      delete query[keys[i]]
    }
  }
  return encodeQuery(query)
}

/**
 * check a domain not a subdomain
 */
export function isValidDomain (domain) {
  // http://xn--eqrt2g.xn--vuq861b/
  const validCnDomains = [
    '政务',
    '公益',
    'mil',
    'gov',
    'ac',
    'org',
    'net',
    'edu',
    'com',
    'bj',
    'tj',
    'sh',
    'cq',
    'he',
    'sx',
    'nm',
    'ln',
    'jl',
    'hl',
    'js',
    'zj',
    'ah',
    'fj',
    'jx',
    'sd',
    'ha',
    'hb',
    'hn',
    'gd',
    'gx',
    'hi',
    'sc',
    'gz',
    'yn',
    'xz',
    'sn',
    'gs',
    'qh',
    'nx',
    'xj',
    'tw',
    'hk',
    'mo',
  ]
  const validDomains = '.REN.WANG.CITIC.TOP.SOHU.XIN.COM.NET.CLUB.XYZ.VIP.SITE.SHOP.INK.INFO.MOBI.RED.PRO.KIM.LTD.GROUP.BIZ.AUTO.LINK.WORK.LAW.BEER.STORE.TECH.FUN.ONLINE.ART.DESIGN.WIKI.LOVE.CENTER.VIDEO.SOCIAL.TEAM.SHOW.COOL.ZONE.WORLD.TODAY.CITY.CHAT.COMPANY.LIVE.FUND.GOLD.PLUS.GURU.RUN.PUB.EMAIL.LIFE.CO.FASHION.FIT.LUXE.YOGA.BAIDU.CLOUD.HOST.SPACE.PRESS.WEBSITE.ARCHI.ASIA.BIO.BLACK.BLUE.GREEN.LOTTO.ORGANIC.PET.PINK.POKER.PROMO.SKI.VOTE.VOTO.ICU.FANS.UNICOM.JPMORGAN.CHASE.CC.TV.BAND.CAB.CAFE.CASH.FAN.FYI.GAMES.MARKET.MBA.NEWS.MEDIA.SALE.SHOPPING.STUDIO.TAX.TECHNOLOGY.VIN.'
  const domains = domain.toLowerCase().split('.')
  if (domains.length === 2) {
    if (validDomains.toLowerCase().indexOf('.' + domains[1] + '.') >= 0) {
      return true
    }
    if (domains[1].length === 2) {
      return true
    }
  } else if (domains.length === 3) {
    return domains[2] === 'cn' && validCnDomains.indexOf(domains[1]) >= 0
  }
  return false
}

export function removeKeyIgnoreCase (dict, needle) {
  var removeKeys = []
  for (var k in dict) {
    if (k.toLowerCase() === needle.toLowerCase()) {
      removeKeys.push(k)
    }
  }
  for (var i = 0; i < removeKeys.length; i++) {
    delete dict[removeKeys[i]]
  }
}

export function getKeyIgnoreCase (dict, needle) {
  for (var k in dict) {
    if (k.toLowerCase() === needle.toLowerCase()) {
      return dict[k]
    }
  }
  return null
}

/* eslint-disable */
export const escapeHTML = str =>
  str.replace(
    /[&<>'"]/g,
    tag =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[tag] || tag),
  )
/* eslint-enable */

/**
 * 替换云账号中OneStack、费用云账号中的YunionCloud为oem.brand.en
 * @param {Object} param data: {Array|Object}
 * @returns {Array|Object} data
 */
export const accountsFilterByOem = (
  {
    data,
    nameKey = 'name',
    idKey = 'id',
    checkByName = true,
    checkById = true,
  },
) => {
  if (!data) return
  let list = data
  if (!R.is(Array, data)) {
    list = [data]
  }

  const lang = getLanguage()

  const ret = list.map(item => {
    if (checkById && item[idKey] === 'yunion' && checkByName && item[nameKey] === 'OneStack') {
      item[nameKey] = setting.brand[lang] || setting.brand.en || item[nameKey]
    } else if (checkByName && item[nameKey] === 'OneStack') {
      item[nameKey] = setting.brand[lang] || setting.brand.en || item[nameKey]
    }
    return item
  })

  return !R.is(Array, data) ? ret[0] : ret
}

/**
 * 替换云账号中OneCloud为oem.brand[language]
 * @param {Object} param data: {Array|Object}
 * @returns {Array|Object} data
 */
export const brandsFilterByOem = (
  {
    data,
    nameKey = 'brand',
  },
) => {
  if (!data) return
  let list = data
  if (!R.is(Array, data)) {
    list = [data]
  }

  const lang = getLanguage()

  const ret = list.map(item => {
    if (item[nameKey] === 'OneCloud') {
      item[nameKey] = setting.brand[lang] || setting.brand.en || item[nameKey]
    }
    return item
  })

  return !R.is(Array, data) ? ret[0] : ret
}

// eslint-disable-next-line no-unused-vars
let isFirstLoadColor = true
export function getColorByCache () {
  let colorArr = []
  const colorStr = process.env.VUE_APP_CHART_COLORS
  const initColors = ['#ADD1F3', '#F3CBAD', '#F3ADB2', '#ADE4B6', '#ADAEF3', '#A593E0', '#7f9eb2', '#f6ea8c', '#a5dff9', '#77AAAD', '#E71D36', '#4ea1d3']
  if (!isFirstLoadColor) return colorArr
  if (colorStr) {
    isFirstLoadColor = false
    colorArr = colorStr.split(',')
  } else {
    colorArr = initColors
  }
  return colorArr
}

export const getWorkflowParamter = (variables = {}, defaultValue = {}) => {
  const keys = Object.keys(variables)
  const paramKey = variables.parameter ? 'parameter' : 'paramter'
  const p_list = keys.filter(key => key.startsWith(`${paramKey}_`))
  const paramterList = p_list.length ? p_list : [paramKey]
  paramterList.sort((a, b) => {
    return Number(a.replace(paramKey + '_', '')) - Number(b.replace(paramKey + '_', ''))
  })
  let paramter = ''
  paramterList.map(key => {
    paramter += variables[key] || ''
  })
  try {
    return paramter ? JSON.parse(paramter) : defaultValue
  } catch (err) {
    console.warn(err)
    return defaultValue
  }
}

export const getWorkflowParamterParams = (paramter) => {
  const len = 3999
  const ret = {}
  const p_str_list = []
  for (let i = 0; i < paramter.length; i += len) {
    p_str_list.push(paramter.slice(i, i + len))
  }
  if (p_str_list.length > 1) {
    ret.paramter = ''
    p_str_list.map((str, idx) => {
      ret[`paramter_${idx}`] = str
    })
  } else {
    ret.paramter = p_str_list[0]
  }
  return ret
}

export const isBlob = (val) => {
  return Object.prototype.toString.call(val) === '[object Blob]'
}

export const blobToJson = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    reader.readAsText(blob)
  })
}

/**
 * 混合数组的排序方法 x,y 必须为字符串或者数字，
 * @param {string || Number} x
 * @param {String || Number} y
 * @example [2,'x', 'a','哈哈', 'c'].sort((a,b)=>mixSortFunc(a,b))
 */
export const mixSortFunc = (x, y) => {
  const reg = /[a-zA-Z0-9]/
  if (reg.test(x) || reg.test(y)) {
    if (x > y) {
      return 1
    } else if (x < y) {
      return -1
    } else {
      return 0
    }
  } else {
    return x.localeCompare(y)
  }
}

/**
 * 去掉对象中的undefined和null的属性值
 * @param {*} obj
 * @returns
 */
export const deleteInvalid = obj => {
  Object.keys(obj).forEach(item => {
    if (!obj[item] && obj[item] !== 0) {
      delete obj[item]
    }
  })
  return obj
}

export const getDurationLabel = (item) => {
  if (item === 'none' || item === 'custom') {
    return i18n.t(`common.duration.${item}`)
  }
  if (item.endsWith('h')) return i18n.t('common.date.hours', [parseInt(item)])
  if (item.endsWith('d')) return i18n.t('common.date.days', [parseInt(item)])
  if (item.endsWith('w')) return i18n.t('common.date.weeks', [parseInt(item)])
  if (item.endsWith('m')) return i18n.t('common.date.months', [parseInt(item)])
  if (item.endsWith('y')) return i18n.t('common.date.years', [parseInt(item)])
  return item
}

export const ppmToPNGDataURL = (base64Data) => {
  // 解码 Base64
  const binaryStr = atob(base64Data)
  // 解析 PPM 头信息
  const lines = binaryStr.split('\n')
  let width = 720
  let height = 400
  if (lines.length > 3) {
    const size = lines[1].split(' ')
    if (size.length === 2) {
      width = parseInt(size[0])
      height = parseInt(size[1])
    }
  }
  // 创建 Canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(width, height)
  // 找到像素数据开始位置（跳过3行头部）
  let dataStart = 0
  let lineCount = 0
  for (let i = 0; i < binaryStr.length; i++) {
    if (binaryStr[i] === '\n') {
      lineCount++
      if (lineCount === 3) {
        dataStart = i + 1
        break
      }
    }
  }
  // 解析 RGB 像素数据
  const pixelData = new Uint8Array(binaryStr.length - dataStart)
  for (let i = 0; i < pixelData.length; i++) {
    pixelData[i] = binaryStr.charCodeAt(dataStart + i)
  }
  // 填充到 ImageData
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const pixelIdx = (y * width + x) * 3
      if (pixelIdx + 2 < pixelData.length) {
        imageData.data[idx] = pixelData[pixelIdx] // R
        imageData.data[idx + 1] = pixelData[pixelIdx + 1] // G
        imageData.data[idx + 2] = pixelData[pixelIdx + 2] // B
        imageData.data[idx + 3] = 255 // Alpha
      }
    }
  }
  ctx.putImageData(imageData, 0, 0)
  // 转换为 PNG Data URL
  return { canvas, url: canvas.toDataURL('image/png') }
}

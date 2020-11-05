import * as R from 'ramda'
import moment from 'moment'
import _ from 'lodash'
import i18n from '@/locales'
import { numerify } from '@/filters'

let tIndex = 0

export const UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

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
export const percentstr = sizestrInstance.percentStr.bind(sizestrInstance)

export const arrayToObj = (arr, itemKey = 'id') => {
  const obj = {}
  arr.forEach(item => {
    obj[item[itemKey]] = item
  })
  return obj
}

export const changeToArr = R.unless(
  R.is(Array),
  R.of,
)

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
export const autoComputeUnit = (series, sourceUnit = 'bps', base = 1000) => { // 单位自动缩进
  let points = series.points
  let unit = 'b'
  const timeColumnIndex = series.columns.findIndex(val => val === 'time') || 1
  const deleteTimeValues = points.map(arr => arr.slice(0, timeColumnIndex))
  let valueArr = deleteTimeValues.reduce((a, b) => a.concat(b))
  valueArr = valueArr.filter(val => val) // 过滤掉 0
  const maxValue = Math.max.apply(null, valueArr)
  if (maxValue >= 1000 && valueArr && valueArr.length > 0) {
    const maxValueStr = sizestr(maxValue, 'B', base)
    unit = maxValueStr.slice(-1) // 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'
    let scaleIndex = UNITS.findIndex(val => val === unit.charAt(0))
    scaleIndex = scaleIndex || UNITS[UNITS.length - 1]
    scaleIndex = scaleIndex < 0 ? 0 : scaleIndex
    const scale = Math.pow(base, scaleIndex)
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
  } else {
    unit += 'b'
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

function extend (to, _from) {
  for (const key in _from) {
    to[key] = _from[key]
  }
  return to
};

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
  let firstValue = ret[0]
  for (var i = 0; i < ret.length; i++) {
    if (condition(ret[i])) {
      firstValue = ret[i]
      ret.splice(i, 1)
      break
    }
  }
  ret.unshift(firstValue)
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
 * @param {String} unit e.g: "%", "bps", "Mbps", "Bps", "cps", "count", "ms", "byte"
 * @param {Number} base
 * @return {Object} e.g: { text: '123 MB', value: '123', unit: 'MB'  }
 */
export const transformUnit = (value, unit = '', base = 1000, numerifyFormat = '0.00') => {
  const number = Number(value)
  const valueStr = numerify(number, numerifyFormat)
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
    if (obj.text.endsWith('B')) {
      obj.text = `${obj.value} ${b}ps`
    } else {
      obj.text += `${b}ps`
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

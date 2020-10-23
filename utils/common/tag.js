import * as R from 'ramda'
import colorHash from '@/utils/colorHash'

/**
 * 判断是不是用户标签
 * @param {String} key
 */
export function isUserTag (key) {
  return key.startsWith('user:')
}
/**
 * 判断是不是同步过来的云标签
 * @param {String} key
 */
export function isExtTag (key) {
  return key.startsWith('ext:')
}
/**
 * 过滤出用户标签，可以忽略指定的Key
 * @param {Object} metadata
 * @param {Array} ignoreKeys
 * @param {Boolean} needExt
 * @return {Array} [{ key, value }]
 */
export function filterUserTag ({
  metadata,
  ignoreKeys = [],
  needExt = false,
  ignorePrefix = false,
}) {
  const arr = []
  const obj = {}
  for (const key in metadata) {
    if (
      (ignoreKeys.length > 0 && ignoreKeys.includes(key)) ||
      (!ignorePrefix && (needExt ? (!isUserTag(key) && !isExtTag(key)) : !isUserTag(key)))
    ) continue
    arr.push({
      key,
      value: metadata[key],
    })
    if (obj[key]) {
      if (!obj.key.includes(metadata[key])) obj[key].push(metadata[key])
    } else {
      obj[key] = [metadata[key]]
    }
  }
  return { arr, obj }
}

/**
 * 过滤出外部标签，可以忽略指定的Key
 * @param {Object} metadata
 * @param {Array} ignoreKeys
 * @param {Boolean} needUser
 * @return {Array} [{ key, value }]
 */
export function filterExtTag ({
  metadata,
  ignoreKeys = [],
  needUser = false,
  ignorePrefix = false,
}) {
  const arr = []
  const obj = {}
  for (const key in metadata) {
    if (
      (ignoreKeys.length > 0 && ignoreKeys.includes(key)) ||
      (!ignorePrefix && (needUser ? (!isUserTag(key) && !isExtTag(key)) : !isExtTag(key)))
    ) continue
    arr.push({
      key,
      value: metadata[key],
    })
    if (obj[key]) {
      if (!obj.key.includes(metadata[key])) obj[key].push(metadata[key])
    } else {
      obj[key] = [metadata[key]]
    }
  }
  return { arr, obj }
}

export function getTagColor (key, value, type = 'hex') {
  // let str = key
  // if (value) str += value
  // return colorHash[type](str)
  return colorHash[type](key)
}

export function getTagTitle (key, value) {
  let str = key
  if (value) str += `:${value}`
  return R.replace(/(ext:|user:)/, '', str)
}

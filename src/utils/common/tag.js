import * as R from 'ramda'
import i18n from '@/locales'
import colorHash from '@/utils/colorHash'

/**
 * 判断是不是用户标签
 * @param {String} key
 */
export function isUserTag (key) {
  return key.startsWith('user:') || isSysTag(key)
}
/**
 * 判断是不是sys标签
 * @param {String} key
 */
export function isSysTag (key) {
  return key.startsWith('sys:')
}
/**
 * 判断是不是同步过来的云标签
 * @param {String} key
 */
export function isExtTag (key) {
  return key.startsWith('ext:')
}
/**
 * 判断是不是org标签
 * @param {String} key
 */
export function isOrgTag (key) {
  return key.startsWith('org:')
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
  // needExt = false,
  supportKeyStarts = ['user:'],
  ignorePrefix = false,
}) {
  const arr = []
  const obj = {}
  for (const key in metadata) {
    if (
      (ignoreKeys.length > 0 && ignoreKeys.includes(key)) ||
      // (!ignorePrefix && (needExt ? (!isUserTag(key) && !isExtTag(key)) : !isUserTag(key)))
      (!ignorePrefix && !supportKeyStarts.some(s => key.startsWith(s)))
    ) continue
    let value = metadata[key]
    const values = []
    try {
      value = JSON.parse(value)
    } catch (err) { }

    if (R.is(Array, value)) {
      value.map(item => {
        values.push(item)
      })
    } else {
      values.push(value)
    }
    values.map(item => {
      arr.push({
        key,
        value: item,
      })
      if (obj[key]) {
        if (!obj[key].includes(item)) obj[key].push(item)
      } else {
        obj[key] = [item]
      }
    })
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

    let value = metadata[key]
    const values = []
    try {
      value = JSON.parse(value)
    } catch (err) { }

    if (R.is(Array, value)) {
      value.map(item => {
        values.push(item)
      })
    } else {
      values.push(value)
    }
    values.map(item => {
      arr.push({
        key,
        value: item,
      })
      if (obj[key]) {
        if (!obj[key].includes(item)) obj[key].push(item)
      } else {
        obj[key] = [item]
      }
    })
  }
  return { arr, obj }
}

export function getTagColor (key, value, type = 'hex') {
  // let str = key
  // if (value) str += value
  // return colorHash[type](str)
  const str = key.replace(/^(ext:|user:)/, '')
  return colorHash[type](str)
}

export function getTagTitle (key, value) {
  let val = value
  let str = R.replace(/(ext:|user:|sys:|org:)/, '', key)
  if (!str) return i18n.t('common.null_tag_key')
  if (str === 'cloud_default') {
    str = i18n.t('common_736')
  }
  if (value === 'cloud_default' || val === '___no_value__') {
    val = i18n.t('common_736')
  }
  if (val) str += `:${val}`
  return str
}

export function getTagValue (value) {
  let val = value
  if (value === 'cloud_default' || val === '___no_value__') {
    val = i18n.t('common_736')
  }
  return val
}

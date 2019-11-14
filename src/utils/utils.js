import * as R from 'ramda'

export const UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y']

export function camel2Words (camel) {
  let tmp = ''
  for (let i = 0; i < camel.length; i++) {
    let ch = camel.charAt(i)
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
  let uuid = []
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
    let nsz = this.normalizeSize(sz, unit, base)
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
    let scale = this.numScale(num)
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
}
const sizestrInstance = new Sizestr()

export const sizestr = sizestrInstance.sizestr.bind(sizestrInstance) // -> 12G  4.5T
export const sizestrWithUnit = sizestrInstance.sizestrWithUnit.bind(sizestrInstance) // -> 12 GB   4.5 TB

export const arrayToObj = (arr, itemKey = 'id') => {
  const obj = {}
  arr.forEach(item => {
    obj[item[itemKey]] = item
  })
  return obj
}

export const changeToArr = R.unless(
  R.is(Array),
  R.of
)

export function getBrowser () {
  var userAgent = navigator.userAgent
  var isOpera = userAgent.indexOf('Opera') > -1
  if (isOpera) {
    return 'Opera'
  }
  if (userAgent.indexOf('Firefox') > -1) {
    return 'FF'
  }
  if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome'
  }
  if (userAgent.indexOf('Safari') > -1) {
    return 'Safari'
  }
  if (userAgent.indexOf('compatible') > -1 && userAgent.indexOf('MSIE') > -1 && !isOpera) {
    return 'IE'
  }
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

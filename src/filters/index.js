import Vue from 'vue'
import marked from 'marked'
import n from 'numerify'
import numerifyBps from 'numerify/lib/plugins/bps.umd'
import numerifyBytes from 'numerify/lib/plugins/bytes.umd'
import numerifyPercent from 'numerify/lib/plugins/percent.umd'
import numerifyCurrency from 'numerify/lib/plugins/currency.umd'
import i18n from '@/locales'

n.register('bps', numerifyBps)
n.register('bytes', numerifyBytes)
n.register('percent', numerifyPercent)
n.register('currency', numerifyCurrency)

const timemsFunc = (timeFormat, value, format, roundingFunction, a) => {
  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour
  const days = value / day
  const hours = value / hour
  const minutes = value / minute
  const seconds = value / second
  const ms = value
  if (days >= 1) {
    if (timeFormat === 'intms') return `${Math.floor(days)}${i18n.t('subDurations.days')}`
    else return `${n._numberToFormat(days, '0.00', roundingFunction)}${i18n.t('subDurations.days')}`
  }
  if (hours >= 1) {
    if (timeFormat === 'intms') return `${Math.floor(hours)}${i18n.t('subDurations.hours')}`
    else return `${n._numberToFormat(hours, '0.00', roundingFunction)}${i18n.t('subDurations.hours')}`
  }
  if (minutes >= 1) {
    if (timeFormat === 'intms') return `${Math.floor(minutes)}${i18n.t('subDurations.minutes')}`
    else return `${n._numberToFormat(minutes, '0.00', roundingFunction)}${i18n.t('subDurations.minutes')}`
  }
  if (seconds >= 1) {
    if (timeFormat === 'intms') return `${Math.floor(seconds)}${i18n.t('subDurations.seconds')}`
    else return `${n._numberToFormat(seconds, '0.00', roundingFunction)}${i18n.t('subDurations.seconds')}`
  }
  if (ms) {
    if (timeFormat === 'intms') return `${Math.floor(ms)}${i18n.t('subDurations.ms')}`
    else return `${n._numberToFormat(ms, '0', roundingFunction)}${i18n.t('subDurations.ms')}`
  }
  return '0'
}

n.register('timems', {
  regexp: /^ms/,
  format (value, format, roundingFunction) {
    value = Number(value)
    if (typeof value !== 'number' || Number.isNaN(value)) {
      value = 0
      console.error('onecloud: value must be Number type by used numerify custom util timems')
    }
    return timemsFunc('ms', value, format, roundingFunction, 1)
  },
})

n.register('timemsint', {
  regexp: /^intms/,
  format (value, format, roundingFunction) {
    value = Number(value)
    if (typeof value !== 'number' || Number.isNaN(value)) {
      value = 0
      console.error('onecloud: value must be Number type by used numerify custom util timems')
    }
    return timemsFunc('intms', value, format, roundingFunction)
  },
})

export const numerify = (num, format = '0.00') => {
  if (num === '-') return '-'
  num = Number(num)
  if (!num) num = 0
  let floatLen = 2
  // 适配科学计数法
  const str = num + ''
  if (str === 'e-8') console.log(str)
  if (str.includes('e-') || str.includes('e+')) {
    const [numStr, exp] = str.includes('e-') ? str.split('e-') : str.split('e+')
    const numList = numStr.split('.')
    const floatStr = numList.length > 1 ? numList[1] : numList[0]
    num = num.toFixed(Math.min(Number(exp) + floatStr.length, 11))
    floatLen = Number(exp) + floatStr.length
  } else {
    const numList = str.split('.')
    floatLen = numList[1] ? numList[1].length : floatLen
  }
  let formatStr = format
  if (formatStr === 'originBill') {
    formatStr = `0,0.[${Array(Math.min(11, floatLen)).fill(0).join('')}]`
  }
  return n(num, formatStr)
}

const filters = {
  numerify,
  marked,
}

Object.entries(filters).forEach(([key, handler]) => Vue.filter(key, handler))

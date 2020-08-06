import Vue from 'vue'
import marked from 'marked'
import n from 'numerify'
import numerifyBps from 'numerify/lib/plugins/bps.umd'
import numerifyBytes from 'numerify/lib/plugins/bytes.umd'
import numerifyPercent from 'numerify/lib/plugins/percent.umd'
import numerifyCurrency from 'numerify/lib/plugins/currency.umd'

n.register('bps', numerifyBps)
n.register('bytes', numerifyBytes)
n.register('percent', numerifyPercent)
n.register('currency', numerifyCurrency)

const timemsFunc = (value, format = 'ms') => {
  const second = 1000
  const minute = 60 * second
  const hour = 60 * minute
  const day = 24 * hour
  const days = Math.floor(value / day)
  const hours = Math.floor((value - days * day) / hour)
  const minutes = Math.floor((value - days * day - hours * hour) / minute)
  const seconds = Math.floor((value - days * day - hours * hour - minutes * minute) / second)
  const ms = value - days * day - hours * hour - minutes * minute - seconds * second
  let output = ''
  if (days) {
    output += `${days}天`
    if (format === 'intms') return output
  }
  if (hours) {
    output += `${hours}小时`
    if (format === 'intms') return output
  }
  if (minutes) {
    output += `${minutes}分钟`
    if (format === 'intms') return output
  }
  if (seconds) {
    output += `${seconds}秒`
    if (format === 'intms') return output
  }
  if (ms) {
    output += `${ms}毫秒`
    if (format === 'intms') return output
  }
  return output
}

n.register('timems', {
  regexp: /^ms/,
  format (value) {
    value = Number(value)
    if (typeof value !== 'number' || Number.isNaN(value)) {
      value = 0
      console.error('onecloud: value must be Number type by used numerify custom util timems')
    }
    return timemsFunc(value, 'ms')
  },
})

n.register('timemsint', {
  regexp: /^intms/,
  format (value) {
    value = Number(value)
    if (typeof value !== 'number' || Number.isNaN(value)) {
      value = 0
      console.error('onecloud: value must be Number type by used numerify custom util timems')
    }
    return timemsFunc(value, 'intms')
  },
})

export const numerify = (num, format = '0.00') => {
  if (num === '-') return '-'
  num = Number(num)
  if (!num) return 0
  return n(num, format)
}

const filters = {
  numerify,
  marked,
}

Object.entries(filters).forEach(([key, handler]) => Vue.filter(key, handler))

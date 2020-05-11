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

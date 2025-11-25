import i18n from '@/locales'

const CURRENCY_LIST = [
  { key: 'CNY', sign: '￥' },
  { key: 'USD', sign: '$' },
  { key: 'BRL', sign: 'R$' },
  { key: 'THB', sign: '฿' },
].map(item => {
  return {
    ...item,
    cn: i18n.te(`currencys.${item.key}`) ? i18n.t(`currencys.${item.key}`) : i18n.t(`common_currency.${item.key}`),
    label: i18n.t(`common.currency_${item.key.toLowerCase()}`),
  }
})

const currencyUnitMap = {}

CURRENCY_LIST.forEach(item => {
  currencyUnitMap[item.key] = { ...item }
  currencyUnitMap[`*${item.key}`] = { ...item, key: `*${item.key}` }
  currencyUnitMap[`_${item.key}`] = { ...item, key: `_${item.key}` }
  currencyUnitMap[`*_${item.key}`] = { ...item, key: `*_${item.key}` }
})

export { CURRENCY_LIST, currencyUnitMap }

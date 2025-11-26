import i18n from '@/locales'

const CURRENCY_LIST = [
  { key: 'CNY', sign: '￥' },
  { key: 'USD', sign: '$' },
  { key: 'EUR', sign: '€' },
  { key: 'BRL', sign: 'R$' },
  { key: 'GBP', sign: '£' },
  { key: 'JPY', sign: 'JPYҰ' },
  { key: 'CAD', sign: 'C$' },
  { key: 'AUD', sign: 'A$' },
  { key: 'CHF', sign: '₣' },
  { key: 'RUB', sign: '₽' },
  { key: 'INR', sign: '₹' },
  { key: 'MXN', sign: 'MXN' },
  { key: 'SGD', sign: 'S$' },
  { key: 'THB', sign: '฿' },
  { key: 'TRY', sign: '₺' },
  { key: 'ZAR', sign: 'R' },
  { key: 'HKD', sign: 'HK$' },
  { key: 'MOP', sign: 'MOP$' },
].map(item => {
  return {
    ...item,
    sign: item.key,
    cn: i18n.te(`currencys.${item.key}`) ? i18n.t(`currencys.${item.key}`) : i18n.t(`common_currency.${item.key}`),
    label: i18n.t(`common_currency.${item.key}`),
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

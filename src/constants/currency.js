import i18n from '@/locales'

export const currencyUnitMap = {
  CNY: {
    sign: '￥',
    cn: i18n.t('bill.text_29'),
    label: i18n.t('bill.text_30'),
  },
  USD: {
    sign: '$',
    cn: i18n.t('bill.text_31'),
    label: i18n.t('bill.text_31'),
  },
  BRL: {
    sign: 'R$',
    cn: i18n.t('bill.currency_brl'),
    label: i18n.t('bill.currency_brl'),
  },
}

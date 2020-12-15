import i18n from '@/locales'

export const chargeTypeColumn = () => {
  return {
    field: 'postpaid_status',
    title: i18n.t('compute.text_498'),
    width: 90,
    slots: {
      default: ({ row }, h) => {
        const chargeTypes = []
        if (row.postpaid_status === 'available') chargeTypes.push(i18n.t('billingType.postpaid'))
        if (row.prepaid_status === 'available') chargeTypes.push(i18n.t('billingType.prepaid'))
        return chargeTypes.map(val => <div>{ val }</div>)
      },
    },
  }
}

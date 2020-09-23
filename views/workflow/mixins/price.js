import { getServerConf } from '../utils'
import i18n from '@/locales'

export default {
  methods: {
    initPriceInfo () {
      const priceInfo = [
        {
          title: i18n.t('common_416'),
          items: [
            {
              field: 'billingType',
              title: i18n.t('table.column.title.bill_type'),
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                const durationUnit = {
                  h: i18n.t('common_11'),
                  w: i18n.t('common_417'),
                  d: i18n.t('common_12'),
                  m: i18n.t('common_13'),
                  y: i18n.t('common_14'),
                }
                const duration = serverConf.duration
                if (!duration || serverConf.billing_type === 'postpaid') {
                  return i18n.t('common_1')
                }
                const d = parseInt(duration)
                const unit = duration.substr(-1)
                return i18n.t('common_418', [d, durationUnit[unit.toLowerCase()]])
              },
            },
            {
              field: 'price',
              title: i18n.t('common_419'),
              formatter: ({ cellValue, row }) => {
                return this.variables.price || 0
              },
            },
          ],
        },
      ]
      this.extraInfo.push(...priceInfo)
    },
  },
}

import { getServerConf } from '../utils'

export default {
  methods: {
    initPriceInfo () {
      const priceInfo = [
        {
          title: '费用信息',
          items: [
            {
              field: 'billingType',
              title: '计费方式',
              formatter: ({ cellValue, row }) => {
                const serverConf = getServerConf(row)
                const durationUnit = {
                  h: '小时',
                  w: '周',
                  d: '天',
                  m: '月',
                  y: '年',
                }
                const duration = serverConf.duration
                if (!duration || serverConf.billing_type === 'postpaid') {
                  return '按量付费'
                }
                const d = parseInt(duration)
                const unit = duration.substr(-1)
                return `包年包月(${d}${durationUnit[unit.toLowerCase()]})`
              },
            },
            {
              field: 'price',
              title: '费用估算',
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

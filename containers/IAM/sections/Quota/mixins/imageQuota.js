import i18n from '@/locales'
import { getRealVal, getRealPercentage } from '../utils'
import QuotaProgress from '../components/QuotaProgress'
import { imageTypeOptions } from '../constants'

export default {
  computed: {
    imageQuota () {
      return {
        columns: [
          {
            field: 'type',
            title: i18n.t('system.text_48'),
            width: 100,
            editRender: { name: 'select', options: imageTypeOptions, events: { change: this.imageTypeChangeHandle }, attrs: { disabled: false } },
            formatter: ({ row }) => {
              const oImageType = imageTypeOptions.find((item) => { return item.value === row.type })
              return (oImageType && oImageType.label) || i18n.t('system.text_25')
            },
          },
          {
            field: 'image',
            title: i18n.t('system.text_68'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.image']), getRealVal(row.image))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.image']) } / { getRealVal(row.image) }</span>,
                ]
              },
            },
          },
          {
            title: i18n.t('system.text_55'),
            width: 100,
            showOverflow: true,
            visible: !this.readyOnly,
            fixed: 'right',
            slots: {
              default: ({ row, column }) => {
                if (this.$refs.xImageQuotaTable.isActiveByRow(row)) {
                  return [
                    <span class="add" onClick={ e => this.saveQuotaTableRowEvent(row, 'image') }>{ this.$t('table.action.save') }</span>,
                    <span class="del" onClick={ e => this.cancleQuotaTableRowEvent(row, 'image') }>{ this.$t('table.action.cacel') }</span>,
                  ]
                } else {
                  if (!this.$matchedPolicy('image_quota_update')) {
                    if (this.$matchedPolicy('image_quota_delete') && row.type) {
                      return [
                        <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'image') }>{ this.$t('table.action.delete') }</span>,
                      ]
                    }
                    return []
                  }
                  if (!row.type) {
                    return [
                      <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'image') }>{ this.$t('table.action.modify') }</span>,
                    ]
                  }
                  return [
                    <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'image') }>{ this.$t('table.action.modify') }</span>,
                    <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'image') }>{ this.$t('table.action.delete') }</span>,
                  ]
                }
              },
            },
          },
        ],
      }
    },
  },
  methods: {
    async fetchImageQuota () {
      this.quotaData.image.loading = true
      const manager = new this.$Manager('image_quotas')
      try {
        const params = {
          scope: this.$store.getters.scope,
        }
        if (this.domain) {
          params.domain = this.domain
        }
        if (this.tenant) {
          params.tenant = this.tenant
        }
        if (this.refresh) {
          params.refresh = true
        }
        const res = await manager.rpc({ methodname: 'GetQuota', params })
        this.quotaData.image.list = res.data.data
      } catch (error) {
        throw error
      } finally {
        this.quotaData.image.loading = false
      }
    },
    imageTypeChangeHandle ({ row, data }, e) {
      if (data && data.length > 0) {
        const val = e.target.value || undefined
        const isKeyRepeat = data.some((item) => {
          return item.type === val
        })
        this.quotaData.image.isKeyRepeat = isKeyRepeat
      }
    },
  },
}

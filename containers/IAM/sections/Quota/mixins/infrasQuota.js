import i18n from '@/locales'
import { getRealVal, getRealPercentage } from '../utils'
import QuotaProgress from '../components/QuotaProgress'

export default {
  computed: {
    infrasQuota () {
      return {
        columns: [
          ...this.commonFields,
          {
            field: 'host',
            title: i18n.t('system.text_69'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.host']), getRealVal(row.host))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.host']) } / { getRealVal(row.host) }</span>,
                ]
              },
            },
          },
          {
            field: 'vpc',
            title: i18n.t('system.text_70'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.vpc']), getRealVal(row.vpc))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.vpc']) } / { getRealVal(row.vpc) }</span>,
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
                if (this.$refs.xInfrasQuotaTable.isActiveByRow(row)) {
                  return [
                    <span class="add" onClick={ e => this.saveQuotaTableRowEvent(row, 'infras') }>{ this.$t('table.action.save') }</span>,
                    <span class="del" onClick={ e => this.cancleQuotaTableRowEvent(row, 'infras') }>{ this.$t('table.action.cacel') }</span>,
                  ]
                } else {
                  if (!this.$matchedPolicy('infras_quota_update')) {
                    if (this.$matchedPolicy('infras_quota_delete') && !this.isAllAny(row)) {
                      return [
                        <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'infras') }>{ this.$t('table.action.delete') }</span>,
                      ]
                    }
                    return []
                  }
                  if (this.isAllAny(row)) {
                    return [
                      <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'infras') }>{ this.$t('table.action.modify') }</span>,
                    ]
                  }
                  return [
                    <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'infras') }>{ this.$t('table.action.modify') }</span>,
                    <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'infras') }>{ this.$t('table.action.delete') }</span>,
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
    async fetchInfrasQuota () {
      this.quotaData.infras.loading = true
      const manager = new this.$Manager('infras_quotas')
      try {
        const params = {
          scope: this.$store.getters.scope,
        }
        if (this.domain) {
          params.domain = this.domain
        }
        if (this.refresh) {
          params.refresh = true
        }
        const res = await manager.rpc({ methodname: 'GetQuota', params })
        this.quotaData.infras.list = res.data.data
      } catch (error) {
        throw error
      } finally {
        this.quotaData.infras.loading = false
      }
    },
  },
}

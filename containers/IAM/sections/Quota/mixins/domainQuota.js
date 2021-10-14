import i18n from '@/locales'
import { getRealVal, getRealPercentage } from '../utils'
import QuotaProgress from '../components/QuotaProgress'

export default {
  computed: {
    domainQuota () {
      return {
        columns: [
          {
            field: 'cloudaccount',
            title: i18n.t('system.text_53'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.cloudaccount']), getRealVal(row.cloudaccount))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.cloudaccount']) } / { getRealVal(row.cloudaccount) }</span>,
                ]
              },
            },
          },
          {
            field: 'globalvpc',
            title: i18n.t('system.text_54'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.globalvpc']), getRealVal(row.globalvpc))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.globalvpc']) } / { getRealVal(row.globalvpc) }</span>,
                ]
              },
            },
          },
          {
            field: 'dns_zone',
            title: i18n.t('system.text_561'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.dns_zone']), getRealVal(row.dns_zone))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.dns_zone']) } / { getRealVal(row.dns_zone) }</span>,
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
                if (this.$refs.xDomainQuotaTable.isActiveByRow(row)) {
                  return [
                    <span class="add" onClick={ e => this.saveQuotaTableRowEvent(row, 'domain') }>{ this.$t('table.action.save') }</span>,
                    <span class="del" onClick={ e => this.cancleQuotaTableRowEvent(row, 'domain') }>{ this.$t('table.action.cacel') }</span>,
                  ]
                } else {
                  if (!this.$matchedPolicy('domain_quota_update')) {
                    if (this.$matchedPolicy('domain_quota_delete') && row.type) {
                      return [
                        <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'domain') }>{ this.$t('table.action.delete') }</span>,
                      ]
                    }
                    return []
                  }
                  if (!row.type) {
                    return [
                      <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'domain') }>{ this.$t('table.action.modify') }</span>,
                    ]
                  }
                  return [
                    <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'domain') }>{ this.$t('table.action.modify') }</span>,
                    <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'domain') }>{ this.$t('table.action.delete') }</span>,
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
    async fetchDomainQuota () {
      this.quotaData.domain.loading = true
      const manager = new this.$Manager('domain_quotas')
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
        this.quotaData.domain.list = res.data.data
      } catch (error) {
        throw error
      } finally {
        this.quotaData.domain.loading = false
      }
    },
  },
}

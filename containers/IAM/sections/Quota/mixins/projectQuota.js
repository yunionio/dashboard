import i18n from '@/locales'
import { getRealVal, getRealPercentage } from '../utils'
import QuotaProgress from '../components/QuotaProgress'

export default {
  computed: {
    projectQuota () {
      return {
        columns: [
          {
            field: 'secgroup',
            title: i18n.t('system.text_71'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.secgroup']), getRealVal(row.secgroup))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.secgroup']) } / { getRealVal(row.secgroup)}</span>,
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
                if (this.$refs.xProjectQuotaTable.isActiveByRow(row)) {
                  return [
                    <span class="add" onClick={ e => this.saveQuotaTableRowEvent(row, 'project') }>{ this.$t('table.action.save') }</span>,
                    <span class="del" onClick={ e => this.cancleQuotaTableRowEvent(row, 'project') }>{ this.$t('table.action.cacel') }</span>,
                  ]
                } else {
                  if (!this.$matchedPolicy('project_quota_update')) return []
                  return [
                    <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'project') }>{ this.$t('table.action.modify') }</span>,
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
    async fetchProjectQuota () {
      this.quotaData.project.loading = true
      const manager = new this.$Manager('project_quotas')
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
        this.quotaData.project.list = []
        const res = await manager.rpc({ methodname: 'GetQuota', params })
        this.quotaData.project.list = res.data.data
      } catch (error) {
        throw error
      } finally {
        this.quotaData.project.loading = false
      }
    },
  },
}

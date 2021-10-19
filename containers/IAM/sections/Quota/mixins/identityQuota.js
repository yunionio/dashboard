import i18n from '@/locales'
import { getRealVal, getRealPercentage } from '../utils'
import QuotaProgress from '../components/QuotaProgress'

export default {
  computed: {
    identityQuota () {
      return {
        columns: [
          {
            field: 'group',
            title: i18n.t('system.text_63'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.group']), getRealVal(row.group))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.group']) } / { getRealVal(row.group) }</span>,
                ]
              },
            },
          },
          {
            field: 'policy',
            title: i18n.t('system.text_64'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.policy']), getRealVal(row.policy))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.policy']) } / { getRealVal(row.policy) }</span>,
                ]
              },
            },
          },
          {
            field: 'project',
            title: i18n.t('system.text_65'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.project']), getRealVal(row.project))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.project']) } / { getRealVal(row.project) }</span>,
                ]
              },
            },
          },
          {
            field: 'role',
            title: i18n.t('system.text_66'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.role']), getRealVal(row.role))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.role']) } / { getRealVal(row.role) }</span>,
                ]
              },
            },
          },
          {
            field: 'user',
            title: i18n.t('system.text_67'),
            minWidth: 200,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.user']), getRealVal(row.user))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.user']) } / { getRealVal(row.user) }</span>,
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
                if (this.$refs.xIdentityQuotaTable.isActiveByRow(row)) {
                  return [
                    <span class="add" onClick={ e => this.saveQuotaTableRowEvent(row, 'identity') }>{ this.$t('table.action.save') }</span>,
                    <span class="del" onClick={ e => this.cancleQuotaTableRowEvent(row, 'identity') }>{ this.$t('table.action.cacel') }</span>,
                  ]
                } else {
                  if (!this.$matchedPolicy('identity_quota_update')) {
                    if (this.$matchedPolicy('identity_quota_delete') && row.type) {
                      return [
                        <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'identity') }>{ this.$t('table.action.delete') }</span>,
                      ]
                    }
                    return []
                  }
                  if (!row.type) {
                    return [
                      <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'identity') }>{ this.$t('table.action.modify') }</span>,
                    ]
                  }
                  return [
                    <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'identity') }>{ this.$t('table.action.modify') }</span>,
                    <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'identity') }>{ this.$t('table.action.delete') }</span>,
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
    async fetchIdentityQuota () {
      this.quotaData.identity.loading = true
      const manager = new this.$Manager('identity_quotas')
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
        this.quotaData.identity.list = res.data.data
      } catch (error) {
        throw error
      } finally {
        this.quotaData.identity.loading = false
      }
    },
  },
}

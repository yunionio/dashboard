import i18n from '@/locales'
import { getRealVal, getRealPercentage, getRealSize } from '../utils'
import QuotaProgress from '../components/QuotaProgress'
import { hypervisorOptions } from '../constants'

export default {
  computed: {
    hostQuota () {
      return {
        columns: [
          ...this.commonFields,
          {
            field: 'zone',
            title: i18n.t('system.text_56'),
            width: 100,
            editRender: { name: 'select', options: [{ label: i18n.t('system.text_25'), value: '' }], events: { change: this.zoneChangeHandle }, attrs: { disabled: false } },
            formatter: ({ row }) => {
              return row.zone || i18n.t('system.text_25')
            },
          },
          {
            field: 'hypervisor',
            title: i18n.t('system.text_57', [this.$t('dictionary.server')]),
            width: 100,
            editRender: { name: 'select', options: [{ label: i18n.t('system.text_25'), value: '' }], events: { change: this.hypervisorChangeHandle }, attrs: { disabled: false } },
            formatter: ({ row }) => {
              const oHypervisor = hypervisorOptions.find((item) => { return item.value === row.hypervisor })
              return (oHypervisor && oHypervisor.label) || i18n.t('system.text_25')
            },
          },
          {
            field: 'count',
            title: i18n.t('system.text_58', [this.$t('dictionary.server')]),
            minWidth: 120,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.count']), getRealVal(row.count))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ row['usage.count'] || 0 } / { row.count }</span>,
                ]
              },
            },
          },
          {
            field: 'cpu',
            title: i18n.t('system.text_59'),
            minWidth: 120,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.cpu']), getRealVal(row.cpu))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ row['usage.cpu'] || 0 } / { row.cpu }</span>,
                ]
              },
            },
          },
          {
            field: 'memory',
            title: i18n.t('system.text_60'),
            minWidth: 120,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.memory']), getRealVal(row.memory))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealSize(row['usage.memory']) } / { getRealSize(row.memory) }</span>,
                ]
              },
            },
          },
          {
            field: 'storage',
            title: i18n.t('system.text_61'),
            minWidth: 120,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.storage']), getRealVal(row.storage))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealSize(row['usage.storage']) } / { getRealSize(row.storage) }</span>,
                ]
              },
            },
          },
          {
            field: 'isolated_device',
            title: i18n.t('system.text_62'),
            minWidth: 120,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.isolated_device']), getRealVal(row.isolated_device))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.isolated_device'])} / { getRealVal(row.isolated_device)}</span>,
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
                if (this.$refs.xHostQuotaTable.isActiveByRow(row)) {
                  return [
                    <span class="add" onClick={ e => this.saveQuotaTableRowEvent(row, 'host') }>{ this.$t('table.action.save') }</span>,
                    <span class="del" onClick={ e => this.cancleQuotaTableRowEvent(row, 'host') }>{ this.$t('table.action.cacel') }</span>,
                  ]
                } else {
                  if (!this.$matchedPolicy('host_quota_update')) {
                    if (this.$matchedPolicy('host_quota_delete') && !this.isAllAny(row)) {
                      return [
                        <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'host') }>{ this.$t('table.action.delete') }</span>,
                      ]
                    }
                    return []
                  }
                  if (this.isAllAny(row)) {
                    return [
                      <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'host') }>{ this.$t('table.action.modify') }</span>,
                    ]
                  }
                  return [
                    <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'host') }>{ this.$t('table.action.modify') }</span>,
                    <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'host') }>{ this.$t('table.action.delete') }</span>,
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
    async fetchHostQuota () {
      this.quotaData.host.loading = true
      const manager = new this.$Manager('quotas')
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
        this.quotaData.host.list = []
        const res = await manager.rpc({ methodname: 'GetQuota', params })
        this.quotaData.host.list = res.data.data
      } catch (error) {
        throw error
      } finally {
        this.quotaData.host.loading = false
      }
    },
  },
}

import i18n from '@/locales'
import { getRealVal, getRealPercentage } from '../utils'
import QuotaProgress from '../components/QuotaProgress'

export default {
  computed: {
    regionQuota () {
      return {
        columns: [
          ...this.commonFields,
          {
            field: 'port',
            title: i18n.t('system.text_73'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number', tooltip: i18n.t('system.text_74') } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.port']), getRealVal(row.port))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.port']) } / { getRealVal(row.port) }</span>,
                ]
              },
            },
          },
          {
            field: 'eport',
            title: i18n.t('system.eport'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number', tooltip: i18n.t('system.text_74') } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.eport']), getRealVal(row.eport))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.eport']) } / { getRealVal(row.eport) }</span>,
                ]
              },
            },
          },
          {
            field: 'eip',
            title: i18n.t('system.text_75'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.eip']), getRealVal(row.eip))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.eip']) } / { getRealVal(row.eip) }</span>,
                ]
              },
            },
          },
          {
            field: 'snapshot',
            title: i18n.t('system.text_76'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.snapshot']), getRealVal(row.snapshot))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.snapshot']) } / { getRealVal(row.snapshot) }</span>,
                ]
              },
            },
          },
          {
            field: 'instance_snapshot',
            title: i18n.t('system.instance_snapshot'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.instance_snapshot']), getRealVal(row.instance_snapshot))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.instance_snapshot']) } / { getRealVal(row.instance_snapshot) }</span>,
                ]
              },
            },
          },
          {
            field: 'bucket',
            title: i18n.t('system.text_77'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.bucket']), getRealVal(row.bucket))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.bucket']) } / { getRealVal(row.bucket) }</span>,
                ]
              },
            },
          },
          {
            field: 'object_cnt',
            title: i18n.t('system.text_78'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.object_cnt']), getRealVal(row.object_cnt))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.object_cnt']) } / { getRealVal(row.object_cnt) }</span>,
                ]
              },
            },
          },
          {
            field: 'object_gb',
            title: i18n.t('system.text_79'),
            width: 120,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.object_gb']), getRealVal(row.object_gb))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.object_gb']) } / { getRealVal(row.object_gb) }</span>,
                ]
              },
            },
          },
          {
            field: 'rds',
            title: i18n.t('system.text_80'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.rds']), getRealVal(row.rds))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.rds']) } / { getRealVal(row.rds) }</span>,
                ]
              },
            },
          },
          {
            field: 'cache',
            title: i18n.t('system.text_81'),
            minWidth: 100,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.cache']), getRealVal(row.cache))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.cache'])} / { getRealVal(row.cache)}</span>,
                ]
              },
            },
          },
          {
            field: 'loadbalancer',
            title: i18n.t('system.text_82'),
            minWidth: 120,
            editRender: { name: 'input', attrs: { type: 'number' } },
            slots: {
              default: ({ row, column }) => {
                const percentage = getRealPercentage(getRealVal(row['usage.loadbalancer']), getRealVal(row.loadbalancer))
                return [
                  <QuotaProgress percentage={ percentage }></QuotaProgress>,
                  <span>{ getRealVal(row['usage.loadbalancer']) } / { getRealVal(row.loadbalancer) }</span>,
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
                if (this.$refs.xRegionQuotaTable.isActiveByRow(row)) {
                  return [
                    <span class="add" onClick={ e => this.saveQuotaTableRowEvent(row, 'region') }>{ this.$t('table.action.save') }</span>,
                    <span class="del" onClick={ e => this.cancleQuotaTableRowEvent(row, 'region') }>{ this.$t('table.action.cacel') }</span>,
                  ]
                } else {
                  if (!this.$matchedPolicy('region_quota_update')) {
                    if (this.$matchedPolicy('region_quota_delete') && !this.isAllAny(row)) {
                      return [
                        <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'region') }>{ this.$t('table.action.delete') }</span>,
                      ]
                    }
                    return []
                  }
                  if (this.isAllAny(row)) {
                    return [
                      <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'region') }>{ this.$t('table.action.modify') }</span>,
                    ]
                  }
                  return [
                    <span class="add" onClick={ e => this.editQuotaTableRowEvent(row, 'region') }>{ this.$t('table.action.modify') }</span>,
                    <span class="del" onClick={ e => this.deleteQuotaTableRowEvent(row, 'region') }>{ this.$t('table.action.delete') }</span>,
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
    async fetchRegionQuota () {
      this.quotaData.region.loading = true
      const manager = new this.$Manager('region_quotas')
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
        this.quotaData.region.list = []
        const res = await manager.rpc({ methodname: 'GetQuota', params })
        this.quotaData.region.list = res.data.data
      } catch (error) {
        throw error
      } finally {
        this.quotaData.region.loading = false
      }
    },
  },
}

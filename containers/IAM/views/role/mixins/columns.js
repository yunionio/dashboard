import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getPublicScopeTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  destroyed () {
    this.pm = null
  },
  created () {
    this.pm = new this.$Manager('policies', 'v1')
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'match_policies',
        title: this.$t('dictionary.policy'),
        width: 100,
        slots: {
          default: ({ row }) => {
            const handleVisibleChange = async (visible) => {
              if (!visible) return
              if (row._policies || !row.match_policies || row.match_policies.length === 0) return
              await this.fetchPolicies({ row })
            }
            if (!row.match_policies || row.match_policies.length === 0) return this.$t('common.notData')
            const columns = [
              { field: 'name', title: this.$t('table.title.name') },
              { field: 'description', title: this.$t('table.title.desc') },
            ]
            const policies = row._policies
            const hasData = Array.isArray(policies) && policies.length > 0
            return [<a-popover trigger="hover" destroyTooltipOnHide onVisibleChange={handleVisibleChange} key={`role-policies-${row.id}-${hasData ? policies.length : 0}`}>
              <div slot="content" style={hasData ? { minWidth: '480px' } : {}}>
                {Array.isArray(policies)
                  ? (hasData
                    ? <vxe-grid data={ policies } columns={ columns } showOverflow={false} row-config={{ isHover: true }} column-config={{ resizable: false }} />
                    : <div>{ this.$t('common.notData') }</div>)
                  : <data-loading />}
              </div>
              <span style="color: var(--antd-wave-shadow-color)">{ (row.match_policies && row.match_policies.length) || 0 }</span>
            </a-popover>]
          },
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'roles' }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
  methods: {
    async fetchPolicies ({ row }) {
      const policies = row.match_policies || []
      if (policies.length <= 0) {
        return true
      }
      try {
        const response = await this.pm.list({
          params: {
            name: policies,
          },
        })
        const data = response.data.data || []
        row._policies = data
        return response
      } catch (error) {
        throw error
      }
    },
  },
}

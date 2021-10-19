import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
  getPublicScopeTableColumn,
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
        type: 'expand',
        width: 100,
        slots: {
          default: ({ row }) => {
            return (row.match_policies && row.match_policies.length) || 0
          },
          content: ({ row }) => {
            const tableData = row._policies
            if (!tableData) {
              return [<span>{ this.$t('common.notData') }</span>]
            }
            const columns = [
              { field: 'name', title: this.$t('table.title.name') },
              { field: 'description', title: this.$t('table.title.desc') },
            ]
            return [
              <vxe-grid
                data={ tableData }
                columns={ columns } />,
            ]
          },
        },
      },
      getPublicScopeTableColumn({ vm: this, resource: 'roles' }),
      getProjectDomainTableColumn(),
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

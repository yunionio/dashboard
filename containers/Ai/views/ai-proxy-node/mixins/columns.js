import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getEnabledTableColumn(),
      {
        field: 'address',
        title: this.$t('aice.aiproxy.address'),
        minWidth: 140,
      },
      {
        field: 'domain',
        title: this.$t('aice.aiproxy.domain'),
        minWidth: 120,
      },
      {
        field: 'is_active',
        title: this.$t('aice.aiproxy.is_active'),
        width: 90,
        formatter: ({ row }) => row.is_active ? this.$t('common.true') : this.$t('common.false'),
      },
      {
        field: 'last_seen',
        title: this.$t('aice.aiproxy.last_seen'),
        minWidth: 160,
        formatter: ({ row }) => row.last_seen || '-',
      },
      {
        field: 'hb_timeout',
        title: this.$t('aice.aiproxy.hb_timeout'),
        width: 120,
      },
      getTimeTableColumn(),
    ]
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AiProxyNodeSidePage', {
        id: row.id,
        resource: 'ai_proxy_nodes',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}

import { getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn, getPublicScopeTableColumn } from '@/utils/common/tableColumn'

const IPSET_TYPE = {
  ipv4_cidr_list: 'IPv4',
  ipv6_cidr_list: 'IPv6',
}

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger vm={this} name='IpSetSidePage' id={row.id} list={this.list} tab='ip-set-detail'>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'ip_set_type',
        title: this.$t('compute.text_175'),
        formatter: ({ row }) => {
          return IPSET_TYPE[row.ip_set_type] || row.ip_set_type || '-'
        },
      },
      {
        field: 'data',
        title: 'CIDR',
        slots: {
          default: ({ row }, h) => {
            const list = Array.isArray(row.data) ? row.data : (row.data ? [row.data] : [])
            if (!list.length) return [<span>-</span>]
            return list.map(item => h('div', item))
          },
        },
      },
      {
        field: 'security_group_count',
        title: this.$t('compute.text_105'),
        formatter: ({ row }) => {
          return row.security_group_count
        },
      },
      getProjectTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'ipsets' }),
      getTimeTableColumn(),
    ]
  },
}

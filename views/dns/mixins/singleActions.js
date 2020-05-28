import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: '修改',
        action: (obj) => {
          this.createDialog('DnsCreateDialog', {
            title: '修改',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
            type: 'update',
          })
        },
        meta: (obj) => ({
          validate: obj.can_update,
        }),
      },
      {
        label: '更多',
        actions: obj => {
          return [
            ...getEnabledSwitchActions(this, obj),
            {
              label: '克隆',
              action: () => {
                this.createDialog('DnsCreateDialog', {
                  title: '克隆',
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  type: 'clone',
                })
              },
            },
            {
              label: '删除',
              permission: 'dnsrecords_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: '删除',
                  name: this.$t('dictionary.dnsrecord'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}

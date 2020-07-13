import {
  getNameDescriptionTableColumn,
  getIpsTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getIpFilter,
  getBrandFilter,
} from '@/utils/common/tableFilter'

export default {
  data () {
    const tenant = this.params && this.params.data && this.params.data[0].tenant
    return {
      serverProps: {
        showSingleActions: true,
        list: this.$list.createList(this, {
          resource: 'servers',
          getParams: {
            filter: 'hypervisor.notin(baremetal,container)',
            tenant,
          },
          filterOptions: {
            name: getNameFilter(),
            ips: getIpFilter(),
            brand: getBrandFilter('compute_engine_brands'),
          },
        }),
        columns: [
          getNameDescriptionTableColumn({
            hideField: true,
            addLock: true,
            addBackup: true,
            edit: false,
            editDesc: false,
            minWidth: 120,
            slotCallback: row => {
              return [
                <list-body-cell-wrap field='name' row={row} />,
              ]
            },
          }),
          getIpsTableColumn({ field: 'ip', title: 'IP' }),
          getBrandTableColumn({ field: 'provider' }),
          getStatusTableColumn({ statusModule: 'server' }),
          getProjectTableColumn(),
          getRegionTableColumn(),
        ],
        singleActions: [
          {
            label: '移除',
            width: 40,
            action: async (obj) => {
              await new this.$Manager('servers').performAction({
                id: obj.id,
                action: 'revoke-secgroup',
                data: {
                  'secgrp.0': obj.secgroup,
                },
              })
              this.list.refresh()
              this.$bus.$emit('list-refresh')
              this.$message.success('移除成功')
            },
          },
        ],
      },
    }
  },
}

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
    return {
      serverListProps: {
        list: this.$list.createList(this, {
          resource: 'servers',
          getParams: {
            filter: 'hypervisor.notin(baremetal,container)',
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
      },
    }
  },
}

import {
  getNameDescriptionTableColumn,
  getIpsTableColumn,
  getProjectTableColumn,
  getStatusTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'
import {
  getNameFilter,
  getIpFilter,
} from '@/utils/common/tableFilter'
import { sizestr } from '@/utils/utils'

export default {
  data () {
    return {
      serverProps: {
        list: this.$list.createList(this, {
          resource: 'servers',
          getParams: {
            filter: 'hypervisor.notin(baremetal,container)',
            tenant: this.params.data[0].tenant,
          },
          filterOptions: {
            name: getNameFilter(),
            ips: getIpFilter(),
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
          {
            field: 'instance_type',
            title: '配置',
            showOverflow: 'ellipsis',
            minWidth: 100,
            sortable: true,
            slots: {
              default: ({ row }) => {
                const ret = []
                if (row.instance_type) {
                  ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
                }
                const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
                return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
              },
            },
          },
          getStatusTableColumn({ statusModule: 'server' }),
          getProjectTableColumn(),
          getRegionTableColumn(),
        ],
      },
    }
  },
}

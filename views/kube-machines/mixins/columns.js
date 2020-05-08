import { NODE_ROLE_MAP } from '@K8S/views/cluster/constants'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import { HYPERVISORS_MAP } from '@/constants'
import BrandIcon from '@/sections/BrandIcon'

export default {
  created () {
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
        field: 'cluster',
        title: '集群',
        minWidth: 50,
      },
      {
        field: 'role',
        title: '角色',
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            const cnRole = NODE_ROLE_MAP[row.role] || row.role
            return [<a-tag class="mr-2" color="blue">{cnRole}</a-tag>]
          },
        },
      },
      getStatusTableColumn({ statusModule: 'kubemachines' }),
      {
        field: 'address',
        title: 'IP地址',
        minWidth: 100,
        showOverflow: 'ellipsis',
      },
      {
        title: '平台',
        field: 'hypervisor',
        slots: {
          default: ({ row }, h) => {
            const brand = HYPERVISORS_MAP[row.hypervisor].brand
            if (!brand) return '-'
            return [
              <BrandIcon name={ brand } />,
            ]
          },
        },
      },
    ]
  },
}

import * as R from 'ramda'
import { NODE_ROLE_MAP } from '@K8S/views/cluster/constants'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
} from '@/utils/common/tableColumn'
import { HYPERVISORS_MAP } from '@/constants'
import BrandIcon from '@/sections/BrandIcon'
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

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
        title: i18n.t('k8s.text_19'),
        minWidth: 50,
      },
      {
        field: 'role',
        title: i18n.t('k8s.text_24'),
        minWidth: 50,
        slots: {
          default: ({ row }, h) => {
            const cnRole = NODE_ROLE_MAP[row.role] || row.role
            return [<a-tag class="mr-2 d-block text-truncate" title={cnRole} color="blue">{cnRole}</a-tag>]
          },
        },
      },
      getStatusTableColumn({ statusModule: 'kubemachines' }),
      {
        field: 'cpuRequests/cpuCapacity',
        title: i18n.t('k8s.text_282'),
        minWidth: 70,
        formatter: ({ row }) => {
          if (row.machine_node && R.is(Object, row.machine_node.allocatedResources)) {
            const nodeInfo = row.machine_node.allocatedResources
            return (nodeInfo.cpuRequests / 1000) + ' / ' + (nodeInfo.cpuCapacity / 1000)
          }
          return '-/-'
        },
      },
      {
        field: 'memoryRequests/memoryCapacity',
        title: i18n.t('k8s.text_101'),
        minWidth: 70,
        formatter: ({ row }) => {
          if (row.machine_node && R.is(Object, row.machine_node.allocatedResources)) {
            const nodeInfo = row.machine_node.allocatedResources
            return sizestr(nodeInfo.memoryRequests, 'B', 1024) + ' / ' + sizestr(nodeInfo.memoryCapacity, 'B', 1024)
          }
          return '-/-'
        },
      },
      {
        field: 'address',
        title: i18n.t('k8s.text_283'),
        minWidth: 100,
        showOverflow: 'ellipsis',
      },
      {
        title: i18n.t('k8s.text_150'),
        field: 'hypervisor',
        slots: {
          default: ({ row }, h) => {
            if (!row.hypervisor) return '-'
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

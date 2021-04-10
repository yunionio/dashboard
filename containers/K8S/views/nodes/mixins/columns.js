import { sizestr } from '@/utils/utils'
import { getTimeTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        edit: false,
        showDesc: false,
        slotCallback: row => {
          const ret = [<side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>]
          if (row.taints) {
            row.taints.forEach(taint => {
              const effect = <div style="color: #999">{ taint.key }：{ taint.effect }</div>
              ret.push(effect)
            })
          }
          return ret
        },
      }),
      {
        field: 'addresses',
        title: 'IP',
        minWidth: 100,
        slots: {
          default: ({ row }, h) => {
            if (row.addresses) {
              const ret = []
              row.addresses.filter(val => val.type === 'InternalIP').map(item => {
                const ip = <div>{item.address}</div>
                ret.push(ip)
              })
              return ret
            }
            return '-'
          },
        },
      },
      {
        field: 'status',
        title: i18n.t('k8s.text_35'),
        minWidth: 70,
        slots: {
          default: ({ row }, h) => {
            return [<span style={{ color: row.ready ? '#67C23A' : '#F56C6C' }}>{ row.ready ? 'Ready' : 'UnReady' }</span>]
          },
        },
      },
      {
        field: 'cpuRequests/cpuCapacity',
        title: i18n.t('k8s.text_282'),
        minWidth: 70,
        formatter: ({ row }) => {
          return (row.allocatedResources.cpuRequests / 1000) + ' / ' + (row.allocatedResources.cpuCapacity / 1000)
        },
      },
      {
        field: 'memoryRequests/memoryCapacity',
        title: i18n.t('k8s.text_101'),
        minWidth: 70,
        formatter: ({ row }) => {
          return sizestr(row.allocatedResources.memoryRequests, 'B', 1024) + ' / ' + sizestr(row.allocatedResources.memoryCapacity, 'B', 1024)
        },
      },
      {
        field: 'allocatedPods/podCapacity',
        title: i18n.t('k8s.text_9'),
        minWidth: 70,
        formatter: ({ row }) => {
          return row.allocatedResources.allocatedPods + ' / ' + row.allocatedResources.podCapacity
        },
      },
      {
        field: 'unschedulable',
        title: i18n.t('k8s.text_296'),
        minWidth: 70,
        formatter: ({ cellValue }) => {
          return !cellValue ? i18n.t('k8s.text_296') : i18n.t('k8s.text_297')
        },
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}

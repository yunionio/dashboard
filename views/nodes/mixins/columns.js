import { sizestr } from '@/utils/utils'
import { getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      {
        field: 'name',
        title: '名称',
        width: 300,
        slots: {
          default: ({ row }, h) => {
            const ret = [<side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>]
            if (row.taints) {
              row.taints.forEach(taint => {
                const effect = <div style="color: #999">{ taint.key }：{ taint.effect }</div>
                ret.push(effect)
              })
            }
            return ret
          },
        },
      },
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
        title: '状态',
        minWidth: 70,
        slots: {
          default: ({ row }, h) => {
            return [<span style={{ color: row.ready ? '#67C23A' : '#F56C6C' }}>{ row.ready ? 'Ready' : 'UnReady' }</span>]
          },
        },
      },
      {
        field: 'cpuRequests/cpuCapacity',
        title: 'CPU(核)',
        minWidth: 70,
        formatter: ({ row }) => {
          return (row.allocatedResources.cpuRequests / 1000) + ' / ' + (row.allocatedResources.cpuCapacity / 1000)
        },
      },
      {
        field: 'memoryRequests/memoryCapacity',
        title: '内存',
        minWidth: 70,
        formatter: ({ row }) => {
          return sizestr(row.allocatedResources.memoryRequests, 'B', 1024) + ' / ' + sizestr(row.allocatedResources.memoryCapacity, 'B', 1024)
        },
      },
      {
        field: 'allocatedPods/podCapacity',
        title: '容器组',
        minWidth: 70,
        formatter: ({ row }) => {
          return row.allocatedResources.allocatedPods + ' / ' + row.allocatedResources.podCapacity
        },
      },
      {
        field: 'unschedulable',
        title: '可调度',
        minWidth: 70,
        formatter: ({ cellValue }) => {
          return !cellValue ? '可调度' : '不可调度'
        },
      },
      getTimeTableColumn({ field: 'creationTimestamp', fromNow: true, sortable: true }),
    ]
  },
}

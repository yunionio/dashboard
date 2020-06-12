import { sizestr } from '@/utils/utils'

export const getReserveResourceColumn = () => {
  return {
    field: '',
    title: '宿主机预留资源',
    minWidth: 100,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        const ret = []
        if (row.reserved_cpu) {
          const config = row.reserved_cpu + 'C' + (row.reserved_memory ? sizestr(row.reserved_memory, 'M', 1024) : '') + (row.reserved_storage ? sizestr(row.reserved_storage, 'M', 1024) : '')
          return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
        }
        return ret
      },
    },
  }
}

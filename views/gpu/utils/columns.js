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
        const config = row.reserved_cpu + 'C' + sizestr(row.reserved_memory, 'M', 1024) + (row.reserved_storage ? sizestr(row.reserved_storage, 'M', 1024) : '')
        return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
      },
    },
  }
}

import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      {
        field: 'index',
        title: '序号',
        width: 50,
        formatter: ({ row }) => {
          return row.index ? row.index : '0'
        },
      },
      getCopyWithContentTableColumn({ field: 'network', title: '网卡名称', sortable: true }),
      getCopyWithContentTableColumn({ field: 'mac_addr', title: 'MAC地址', sortable: true }),
      getCopyWithContentTableColumn({ field: 'ip_addr', title: 'IP地址', sortable: true }),
      getCopyWithContentTableColumn({ field: 'driver', title: '驱动' }),
      {
        field: 'bw_limit',
        title: '带宽限制',
        width: 100,
        formatter: ({ row }) => {
          return `${row.bw_limit}Mbps`
        },
        slots: {
          header: ({ column }) => {
            return [
              <a-tooltip title='"0"代表带宽没有限制'>
                <span class='mr-1'>{ column.title }</span>
                <icon type="question" />
              </a-tooltip>,
            ]
          },
        },
      },
    ]
  },
}

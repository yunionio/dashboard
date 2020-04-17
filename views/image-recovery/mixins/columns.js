import * as R from 'ramda'
import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import { getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({ field: 'name', title: '名称' }),
      {
        field: 'os_type',
        title: '操作系统',
        width: 70,
        slots: {
          default: ({ row }) => {
            if (!row.properties || R.isEmpty(row.properties)) return '未知'
            let name = !row.properties.os_distribution ? row.properties.os_type : decodeURI(row.properties.os_distribution || '')
            name = name || ''
            if (name.includes('Windows') || name.includes('windows')) {
              name = 'Windows'
            }
            const tooltip = row.properties.os_version ? `${name} ${row.properties.os_version}` : name
            return [
              <SystemIcon tooltip={ tooltip } name={ name } />,
            ]
          },
        },
      },
      {
        field: 'disk_format',
        title: '格式',
        width: 100,
      },
      {
        field: 'size',
        title: '镜像大小',
        width: 100,
        formatter: ({ cellValue }) => {
          return sizestr(cellValue, 'B', 1024)
        },
      },
      getStatusTableColumn({ statusModule: 'image' }),
      getProjectTableColumn(),
    ]
  },
}

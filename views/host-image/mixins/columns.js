import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import { getStatusTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getPublicScopeTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        width: 200,
        addLock: true,
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'child_image',
        title: '子镜像',
        width: 150,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            const arr = [...(row.data_images || [])]
            arr.push(row.root_image.name)
            return `${arr.length}个`
          },
          content: ({ row }) => {
            let list = []
            if (row.data_images && row.data_images.length > 0) {
              list = row.data_images.map(val => (
                <a-tag class='mb-2'>{ val.name }</a-tag>
              ))
            }
            list.push(
              <a-tag class='mb-2'>{ row.root_image.name }</a-tag>
            )
            return list
          },
        },
      },
      {
        field: 'disk_format',
        title: '格式',
        width: 100,
        formatter: ({ cellValue }) => {
          return cellValue && cellValue.toUpperCase()
        },
      },
      {
        field: 'os_type',
        title: '系统',
        width: 60,
        slots: {
          default: ({ row }) => {
            if (!row.properties) return
            let name = row.properties.os_distribution ? decodeURI(row.properties.os_distribution) : row.properties.os_type || ''
            if (name.includes('Windows') || name.includes('windows')) {
              name = 'Windows'
            }
            const tooltip = (row.properties.os_version ? `${name} ${row.properties.os_version}` : name) || '未知'
            return [
              <SystemIcon tooltip={ tooltip } name={ name } />,
            ]
          },
        },
      },
      {
        field: 'size',
        title: '镜像大小',
        minWidth: 100,
        formatter: ({ cellValue }) => {
          return sizestr(cellValue, 'B', 1024)
        },
      },
      getStatusTableColumn({ statusModule: 'image' }),
      getPublicScopeTableColumn({ vm: this }),
      getProjectTableColumn(),
      {
        field: 'is_standard',
        title: '镜像类型',
        width: 100,
        formatter: ({ cellValue }) => {
          if (cellValue) return '公共镜像'
          return '自定义镜像'
        },
      },
      getTimeTableColumn(),
    ]
  },
}

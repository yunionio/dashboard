import FileProcess from '@Compute/views/image/components/FileProcess'
import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import { getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn, getPublicScopeTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        width: 200,
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        slotCallback: (row, h) => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{ row.name }</side-page-trigger>
          )
        },
        formRules: [
          { required: true, message: '请输入名称' },
          { validator: this.$validate('imageName') },
        ],
      }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'image', columns: () => this.columns }),
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
          default: ({ row }, h) => {
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
        formatter: ({ cellValue, row }) => {
          return sizestr(cellValue, 'B', 1024)
        },
      },
      {
        field: 'status',
        title: '状态',
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 80,
        slots: {
          default: ({ row }, h) => {
            const fileProcess = row.status === 'saving' ? <FileProcess size={ row.size }></FileProcess> : null
            return [
              <div class='text-truncate'>
                <status status={ row['status'] } statusModule={ 'image' } />
                { fileProcess }
              </div>,
            ]
          },
        },
      },
      getPublicScopeTableColumn({ vm: this }),
      getProjectTableColumn(),
      // isPublicTableColumn(),
      {
        field: 'is_standard',
        title: '镜像类型',
        width: 100,
        formatter: ({ cellValue }) => {
          if (cellValue === true || cellValue === 'true') return '公共镜像'
          return '自定义镜像'
        },
      },
      getTimeTableColumn(),
    ]
  },
}

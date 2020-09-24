import FileProcess from '@Compute/views/image/components/FileProcess'
import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import { getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn, getPublicScopeTableColumn, getTagTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

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
          { required: true, message: i18n.t('compute.text_210') },
          { validator: this.$validate('imageName') },
        ],
      }),
      {
        field: 'status',
        title: i18n.t('compute.text_268'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 80,
        slots: {
          default: ({ row }, h) => {
            const fileProcess = row.status === 'saving' ? <FileProcess size={ row.size }></FileProcess> : null
            return [
              <div class='text-truncate'>
                <status status={ row.status } statusModule={ 'image' } />
                { fileProcess }
              </div>,
            ]
          },
        },
      },
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'image', columns: () => this.columns }),
      {
        field: 'disk_format',
        title: i18n.t('compute.text_398'),
        width: 100,
        formatter: ({ cellValue }) => {
          return cellValue && cellValue.toUpperCase()
        },
      },
      {
        field: 'os_type',
        title: i18n.t('table.title.os'),
        width: 60,
        slots: {
          default: ({ row }, h) => {
            if (!row.properties) return
            let name = row.properties.os_distribution ? decodeURI(row.properties.os_distribution) : row.properties.os_type || ''
            if (name.includes('Windows') || name.includes('windows')) {
              name = 'Windows'
            }
            const tooltip = (row.properties.os_version ? `${name} ${row.properties.os_version}` : name) || i18n.t('compute.text_339')
            return [
              <SystemIcon tooltip={ tooltip } name={ name } />,
            ]
          },
        },
      },
      {
        field: 'size',
        title: i18n.t('compute.text_610'),
        minWidth: 100,
        formatter: ({ cellValue, row }) => {
          return sizestr(cellValue, 'B', 1024)
        },
      },
      {
        field: 'is_standard',
        title: i18n.t('compute.text_611'),
        width: 100,
        formatter: ({ cellValue }) => {
          if (cellValue === true || cellValue === 'true') return i18n.t('compute.text_620')
          return i18n.t('compute.text_621')
        },
      },
      getTimeTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'images' }),
      getProjectTableColumn(),
      // isPublicTableColumn(),
    ]
  },
}

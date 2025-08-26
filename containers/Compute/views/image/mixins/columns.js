import FileProcess from '@Compute/views/image/components/FileProcess'
import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import { getNameDescriptionTableColumn, getProjectTableColumn, getTimeTableColumn, getPublicScopeTableColumn, getTagTableColumn, getOsArch } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        width: 200,
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        addEncrypt: true,
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
        title: i18n.t('common.status'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 80,
        slots: {
          default: ({ row }, h) => {
            const fileProcess = row.status === 'saving' ? <FileProcess size={ row.size }></FileProcess> : null
            const log = <side-page-trigger class="ml-1" onTrigger={ () => this.handleOpenSidepage(row, 'event-drawer') }>{ this.$t('common.view_logs') }</side-page-trigger>
            return [
              <div class='text-truncate'>
                <div class="d-flex align-items-center">
                  <status status={ row.status } statusModule={ 'image' } process={ row.progress } />
                  { row.status?.includes('fail') ? log : null }
                </div>
                { fileProcess }
              </div>,
            ]
          },
        },
        formatter: ({ row }) => {
          return this.$te(`status.image.${row.status}`) ? this.$t(`status.image.${row.status}`) : row.status
        },
      },
      getTagTableColumn({ onManager: this.onManager, resource: 'images', columns: () => this.columns }),
      {
        field: 'disk_format',
        title: i18n.t('table.title.disk_format'),
        width: 100,
        formatter: ({ cellValue, row }) => {
          return (cellValue && cellValue.toUpperCase()) || row.info?.disk_format || '-'
        },
      },
      getOsArch({ field: 'properties.os_arch' }),
      {
        field: 'os_type',
        title: i18n.t('table.title.os'),
        width: 60,
        slots: {
          default: ({ row }, h) => {
            if (!row.properties && !row.os_type) return
            const dist = row.properties?.os_distribution || row.properties?.distro || row.os_type
            const version = row.properties?.os_version || row.properties?.version || row.os_version

            let name = ''
            let tooltip = ''
            if (dist) {
              tooltip = version ? (version.includes(dist) ? version : `${decodeURI(dist)} ${version}`) : dist
            } else if (row.properties?.os_type) {
              tooltip = row.properties?.os_type
            } else {
              tooltip = i18n.t('compute.text_339')
            }

            name = dist || row.properties?.os_type || ''
            if (name.includes('Windows') || name.includes('windows')) {
              name = 'Windows'
            } else if (name.startsWith('Linux') || name.startsWith('linux')) {
              name = 'Linux'
            }
            return [
              <SystemIcon tooltip={ tooltip } name={ name } />,
            ]
          },
        },
        formatter: ({ row }) => {
          if (!row.properties && !row.os_type) return
          const dist = row.properties?.os_distribution || row.properties?.distro || row.os_type

          let name = ''

          name = dist || row.properties?.os_type || ''
          if (name.includes('Windows') || name.includes('windows')) {
            name = 'Windows'
          } else if (name.includes('Linux') || name.includes('linux')) {
            name = 'Linux'
          }
          return name
        },
      },
      {
        field: 'size',
        title: i18n.t('table.title.image_size'),
        minWidth: 100,
        formatter: ({ cellValue, row }) => {
          return sizestr(cellValue, 'B', 1024)
        },
      },
      {
        field: 'is_standard',
        title: i18n.t('table.title.image_type'),
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

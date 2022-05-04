import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import { getStatusTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, getPublicScopeTableColumn, getTimeTableColumn, getTagTableColumn, getOsArch } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        width: 200,
        addLock: true,
        addEncrypt: true,
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'image' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'guestimages', columns: () => this.columns }),
      {
        field: 'child_image',
        title: i18n.t('table.title.child_image'),
        width: 150,
        type: 'expand',
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.data_images) return [<data-loading />]
            const arr = [...(row.data_images || [])]
            arr.push(row.root_image.name)
            return i18n.t('compute.text_619', [arr.length])
          },
          content: ({ row }) => {
            let list = []
            if (row.data_images && row.data_images.length > 0) {
              list = row.data_images.map(val => (
                <a-tag class='mb-2'>{ val.name }</a-tag>
              ))
            }
            list.push(
              <a-tag class='mb-2'>{ row.root_image?.name }</a-tag>,
            )
            return list
          },
        },
      },
      {
        field: 'disk_format',
        title: i18n.t('table.title.disk_format'),
        width: 100,
        slots: {
          default: ({ row }) => {
            if (!row.disk_format) return [<data-loading />]
            return row.disk_format.toUpperCase()
          },
        },
      },
      getOsArch(),
      {
        field: 'os_type',
        title: i18n.t('table.title.os'),
        width: 60,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.properties) return [<data-loading />]
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
        title: i18n.t('table.title.image_size'),
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && row.size === undefined) return [<data-loading />]
            return sizestr(row.size, 'B', 1024)
          },
        },
      },
      {
        field: 'is_standard',
        title: i18n.t('table.title.image_type'),
        width: 100,
        formatter: ({ cellValue }) => {
          if (cellValue) return i18n.t('compute.text_620')
          return i18n.t('compute.text_621')
        },
      },
      getTimeTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'guestimages' }),
      getProjectTableColumn(),
    ]
  },
}

import * as R from 'ramda'
import { sizestr } from '@/utils/utils'
import SystemIcon from '@/sections/SystemIcon'
import { getStatusTableColumn, getCopyWithContentTableColumn, getProjectTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({ field: 'name', title: i18n.t('compute.text_228') }),
      getStatusTableColumn({ statusModule: 'image' }),
      {
        field: 'disk_format',
        title: i18n.t('compute.text_398'),
        width: 100,
      },
      {
        field: 'os_type',
        title: i18n.t('compute.text_267'),
        width: 70,
        slots: {
          default: ({ row }) => {
            if (!row.properties || R.isEmpty(row.properties)) return i18n.t('compute.text_339')
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
        field: 'size',
        title: i18n.t('table.title.image_size'),
        width: 100,
        formatter: ({ cellValue }) => {
          return sizestr(cellValue, 'B', 1024)
        },
      },
      getTimeTableColumn({ field: 'auto_delete_at', title: i18n.t('compute.text_480') }),
      getProjectTableColumn(),
    ]
  },
}

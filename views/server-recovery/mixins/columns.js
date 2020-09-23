import { sizestr } from '@/utils/utils'
import { getBrandTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getIpsTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn({ field: 'name', title: i18n.t('compute.text_228'), sortable: true }),
      getIpsTableColumn({ field: 'ips', title: 'IP' }),
      {
        field: 'instance_type',
        title: i18n.t('compute.text_295'),
        minWidth: 120,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            const ret = []
            if (row.instance_type) {
              ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
            }
            const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
            return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
          },
        },
      },
      {
        field: 'os_type',
        title: i18n.t('table.column.title.os'),
        width: 60,
        slots: {
          default: ({ row }) => {
            let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
            if (name.includes('Windows') || name.includes('windows')) {
              name = 'Windows'
            }
            const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
            const tooltip = (version.includes(name) ? version : `${name} ${version}`) || i18n.t('compute.text_339') // 去重
            return [
              <SystemIcon tooltip={ tooltip } name={ name } />,
            ]
          },
        },
      },
      getStatusTableColumn({ statusModule: 'server' }),
      getCopyWithContentTableColumn({ field: 'host', title: i18n.t('compute.text_111') }),
      getBrandTableColumn(),
      getTimeTableColumn({ field: 'auto_delete_at', title: i18n.t('compute.text_480') }),
    ]
  },
}

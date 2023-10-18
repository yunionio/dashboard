import { SERVER_TYPE } from '@Compute/constants'
import { sizestr } from '@/utils/utils'
import { getNameDescriptionTableColumn, getBrandTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getIpsTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import i18n from '@/locales'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        field: 'name',
        edit: false,
        editDesc: false,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({ field: 'id', title: 'ID' }),
      getCopyWithContentTableColumn({ field: 'external_id', title: i18n.t('table.title.external_id') }),
      getStatusTableColumn({ statusModule: 'server', hiddenLogView: true }),
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
        title: i18n.t('table.title.os'),
        width: 60,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.metadata) return [<data-loading />]
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
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'host',
        title: i18n.t('compute.text_111'),
        hideField: true,
        slotCallback: row => {
          if (this.isPreLoad && !row.host) return [<data-loading />]
          if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public) {
            return '-'
          }
          return row.host
        },
      }),
      getTimeTableColumn({ field: 'auto_delete_at', title: i18n.t('compute.text_480'), vm: this }),
    ]
  },
}

import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import SystemIcon from '@/sections/SystemIcon'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getStatusTableColumn, getCopyWithContentTableColumn, getIpsTableColumn, getNameDescriptionTableColumn, getTagTableColumn, getRegionTableColumn, getTimeTableColumn, getBrandTableColumn, getAccountTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        addBackup: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'server', vm: this }),
      getTagTableColumn({ onManager: this.onManager, resource: 'server', columns: () => this.columns }),
      getIpsTableColumn({ field: 'ip', title: 'IP' }),
      {
        field: 'instance_type',
        title: i18n.t('table.title.flavor'),
        showOverflow: 'ellipsis',
        minWidth: 120,
        sortable: true,
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
        width: 50,
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
      {
        field: 'login_account',
        title: i18n.t('table.title.init_keypair'),
        width: 50,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
          },
        },
      },
      getCopyWithContentTableColumn({
        field: 'host',
        title: i18n.t('res.machine'),
        hideField: true,
        slotCallback: row => {
          if (!row.host) return '-'
          return [<span>{ row.host }</span>]
        },
        hidden: () => this.$store.getters.isProjectMode,
      }),
      getBrandTableColumn(),
      {
        field: 'host_sn',
        title: 'SN',
        minWidth: 70,
        showOverflow: 'ellipsis',
      },
      getProjectTableColumn(),
      getRegionTableColumn(),
      getAccountTableColumn(),
      getTimeTableColumn(),
    ]
  },
}

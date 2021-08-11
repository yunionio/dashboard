
// import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getAccountTableColumn } from '@/utils/common/tableColumn'
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
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name || row.external_id }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'mongodb' }),
      {
        field: 'instance_type',
        title: this.$t('cloudenv.text_459'),
        showOverflow: 'ellipsis',
        minWidth: 120,
        sortable: true,
        slots: {
          default: ({ row }) => {
            const ret = []
            if (row.instance_type) {
              ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
            }
            const config = row.vcpu_count + 'C' + sizestr(row.vmem_size_mb || 0, 'M', 1024) + sizestr(row.disk_size_mb || 0, 'M', 1024)
            return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
          },
        },
      },
      {
        field: 'ip_addr',
        title: i18n.t('db.text_152'),
        minWidth: 200,
        slots: {
          default: ({ row }) => {
            if (!row.ip_addr) return '-'
            const ret = row.ip_addr.split(';').map(ip => {
              return <list-body-cell-wrap hide-field copy row={{ ip: `${ip}:${row.port}` }} field="ip">{`${ip}:${row.port}`}</list-body-cell-wrap>
            })
            return ret
          },
        },
      },
      {
        field: 'engine_version',
        title: i18n.t('db.text_377'),
        slots: {
          default: ({ row }) => {
            const ret = [<div>{row.engine} {row.engine_version}</div>]
            if (row.disk_size_mb) {
              ret.push(<div class='text-truncate' style={{ color: '#53627C' }}>{ sizestr(row.disk_size_mb, 'M', 1024) }</div>)
            }
            return ret
          },
        },
      },
      getBrandTableColumn(),
      getAccountTableColumn(),
      getProjectTableColumn(),
      getRegionTableColumn(),
    ]
  },
}

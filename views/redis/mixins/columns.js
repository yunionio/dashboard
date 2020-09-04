import { ENGINE_ARCH } from '../constants/index.js'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getTagTableColumn, getBillingTableColumn } from '@/utils/common/tableColumn'
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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'elasticcache', columns: () => this.columns }),
      {
        field: 'arch_type',
        title: i18n.t('db.text_119'),
        width: 100,
        slots: {
          default: ({ row }) => {
            const type = row.local_category || row.arch_type
            return ENGINE_ARCH[type] || type
          },
        },
      },
      {
        field: 'instance_type',
        title: i18n.t('db.text_109'),
        width: 50,
        slots: {
          default: ({ row }) => {
            return sizestr(row.capacity_mb, 'M', 1024)
          },
        },
      },
      {
        field: 'engine',
        title: i18n.t('db.text_112'),
        width: 100,
        slots: {
          default: ({ row }) => {
            return `${row.engine} ${row.engine_version}`
          },
        },
      },
      {
        field: 'password',
        title: i18n.t('db.text_195'),
        width: 50,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={row.id} resourceType='elasticcaches' />]
          },
        },
      },
      {
        field: 'private_dns',
        title: i18n.t('db.text_152'),
        minWidth: 200,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            const pri = row.private_dns || row.private_ip_addr
            const pub = row.public_dns || row.public_ip_addr
            if (!pri && !pub) {
              return '-'
            }
            const connection = (title, value) => {
              if (!value) {
                return null
              }
              return (
                <div class="d-flex align-items-center">
                  <span class="text-truncate">
                    {title}：{value}
                  </span>
                  <copy message={value} />
                </div>
              )
            }
            return [
              connection(i18n.t('db.text_153'), pri),
              connection(i18n.t('db.text_154'), pub),
            ]
          },
        },
      },
      {
        field: 'private_connect_port',
        title: i18n.t('db.text_303'),
        width: 100,
        slots: {
          default: ({ row }) => {
            if (!row.private_connect_port && !row.public_connect_port) {
              return '-'
            }
            const ports = []
            if (row.private_connect_port && (row.private_dns || row.private_ip_addr)) {
              ports.push(<div> 内网：{row.private_connect_port}</div>)
            }
            if (row.public_connect_port && (row.public_dns || row.public_ip_addr)) {
              ports.push(<div>外网：{row.public_connect_port}</div>)
            }
            return ports
          },
        },
      },
      {
        field: 'account',
        title: i18n.t('db.text_67'),
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            return row.account
          },
        },
      },
      getBillingTableColumn({ vm: this }),
      getStatusTableColumn({ statusModule: 'redis' }),
      getProjectTableColumn(),
      getBrandTableColumn(),
      getRegionTableColumn(),
    ]
  },
}

import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { ENGINE_ARCH } from '../constants/index.js'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getTagTableColumn, getBillingTableColumn } from '@/utils/common/tableColumn'

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
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'elasticcache', columns: () => this.columns }),
      {
        field: 'arch_type',
        title: '实例类型',
        width: 70,
        slots: {
          default: ({ row }) => {
            const type = row.local_category || row.arch_type
            return ENGINE_ARCH[type] || type
          },
        },
      },
      {
        field: 'instance_type',
        title: '配置',
        width: 50,
        slots: {
          default: ({ row }) => {
            return sizestr(row.capacity_mb, 'M', 1024)
          },
        },
      },
      {
        field: 'engine',
        title: '类型版本',
        width: 70,
        slots: {
          default: ({ row }) => {
            return `${row.engine} ${row.engine_version}`
          },
        },
      },
      {
        field: 'password',
        title: '密码',
        width: 50,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={row.id} resourceType='elasticcaches' />]
          },
        },
      },
      {
        field: 'private_dns',
        title: '链接地址',
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
              connection('内网', pri),
              connection('外网', pub),
            ]
          },
        },
      },
      {
        field: 'private_connect_port',
        title: '端口',
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
              ports.push(<div>外网：{row.public_connect_port}</div>,)
            }
            return ports
          },
        },
      },
      {
        field: 'account',
        title: '云账号',
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

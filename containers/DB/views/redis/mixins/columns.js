import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { sizestr } from '@/utils/utils'
import { getProjectTableColumn, getRegionTableColumn, getStatusTableColumn, getNameDescriptionTableColumn, getBrandTableColumn, getTagTableColumn, getBillingTableColumn, getAccountTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import i18n from '@/locales'
import { ENGINE_ARCH } from '../constants/index.js'

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
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.name')
        },
      }),
      getStatusTableColumn({
        statusModule: 'redis',
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.status')
        },
      }),
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'redis_elasticcaches',
        columns: () => this.columns,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.metadata')
        },
      }),
      {
        field: 'arch_type',
        title: i18n.t('db.text_119'),
        width: 100,
        formatter: ({ row }) => {
          const type = row.local_category || row.arch_type
          return ENGINE_ARCH[type] || type
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.arch_type')
        },
      },
      {
        field: 'instance_type',
        title: i18n.t('db.text_109'),
        width: 50,
        formatter: ({ row }) => {
          return sizestr(row.capacity_mb, 'M', 1024)
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.instance_type')
        },
      },
      {
        field: 'engine',
        title: i18n.t('db.text_112'),
        width: 100,
        formatter: ({ row }) => {
          return `${row.engine} ${row.engine_version}`
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.engine')
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
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.password')
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
              return [
                <list-body-cell-wrap hide-field copy message={value}>
                  {title} : <span>{ value || '-' }</span>
                </list-body-cell-wrap>,
              ]
            }
            return [
              connection(i18n.t('db.text_153'), pri),
              connection(i18n.t('db.text_154'), pub),
            ]
          },
        },
        formatter: ({ row }) => {
          const pri = row.private_dns || row.private_ip_addr
          const pub = row.public_dns || row.public_ip_addr
          if (!pri && !pub) {
            return '-'
          }
          return `${i18n.t('db.text_153') + ':' + pri}, ${i18n.t('db.text_154') + ':' + pub}`
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.private_dns')
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
              ports.push(<div>{ this.$t('common.intranet_1var', [row.private_connect_port]) }</div>)
            }
            if (row.public_connect_port && (row.public_dns || row.public_ip_addr)) {
              ports.push(<div>{ this.$t('common.extranet_1var', [row.public_connect_port]) }</div>)
            }
            return ports
          },
        },
        formatter: ({ row }) => {
          if (!row.private_connect_port && !row.public_connect_port) {
            return '-'
          }
          const ports = []
          if (row.private_connect_port && (row.private_dns || row.private_ip_addr)) {
            ports.push(this.$t('common.intranet_1var', [row.private_connect_port]))
          }
          if (row.public_connect_port && (row.public_dns || row.public_ip_addr)) {
            ports.push(this.$t('common.extranet_1var', [row.public_connect_port]))
          }
          return ports.join(',')
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.private_connect_port')
        },
      },
      {
        field: 'secgroups',
        title: i18n.t('res.secgroup'),
        minWidth: 80,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            return row.secgroups?.map(item => item.name).join(',')
          },
        },
        formatter: ({ row }) => {
          return row.secgroups?.map(item => item.name).join(',')
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('slb_hidden_columns.secgroups')
        },
      },
      getBillingTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.billing_type')
        },
      }),
      getBrandTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.brand')
        },
      }),
      getAccountTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.account')
        },
      }),
      getProjectTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.tenant')
        },
      }),
      getRegionTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.region')
        },
      }),
      getTimeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('redis_hidden_columns.created_at')
        },
      }),
    ]
  },
}

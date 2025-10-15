import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { SERVER_TYPE } from '@Compute/constants'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getIpsTableColumn,
  getNameDescriptionTableColumn,
  getTagTableColumn,
  getBillingTableColumn,
  getTimeTableColumn,
  getOsArch,
  getAccountTableColumn,
} from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import { sizestr } from '@/utils/utils'
import { findPlatform, typeClouds } from '@/utils/common/hypervisor'
import i18nLocale from '@/locales'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  data () {
    return {
      columns: [],
    }
  },
  created () {
    this.serverManager = new this.$Manager('servers')
    const doCreateOrSwitchBackup = (obj) => {
      this.execLoading = true
      this.serverManager.performAction({
        id: obj.id,
        action: 'reconcile-backup',
        data: {},
      }).then((res) => {
        this.execLoading = false
        this.$message.success(this.$t('message.exec_success'))
      }).catch((err) => {
        this.execLoading = false
        this.$message.success(this.$t('message.exec_fail'))
        throw err
      })
    }
    const getToolTip = (row) => {
      const num = row.metadata.create_backup_count || row.metadata.switch_backup_count
      let time = row.metadata.create_backup || row.metadata.switch_backup
      if (time) {
        const aLink = <a-button type="link" class="oc-pointer" disabled={this.execLoading} style="padding: 0;" onClick={() => doCreateOrSwitchBackup(row)}>{this.$t('compute.text_1341')}</a-button>
        const aIcon = <a-icon type="exclamation-circle" class="ml-1 error-color oc-pointer" />
        try {
          time = this.$moment(JSON.parse(time)).format()
        } catch (error) {
          throw new Error('Failed to parse date', error)
        }
        if (row.metadata.create_backup) {
          return <a-tooltip placement="right">
            <template slot="title">
              <i18n path="compute.text_1342">
                <template slot="num">{num}</template>
                <template slot="time">{time}</template>
                <template slot="link">{aLink}</template>
              </i18n>
            </template>
            {aIcon}
          </a-tooltip>
        } else if (row.metadata.switch_backup) {
          return <a-tooltip placement="right">
            <template slot="title">
              <i18n path="compute.text_1343">
                <template slot="num">{num}</template>
                <template slot="time">{time}</template>
                <template slot="link">{aLink}</template>
              </i18n>
            </template>
            {aIcon}
          </a-tooltip>
        }
      }
      return null
    }
    const columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        addEncrypt: true,
        addBackup: true,
        formRules: [
          { required: true, message: i18nLocale.t('compute.text_210') },
          // { validator: this.$validate('resourceCreateName') },
        ],
        statusModule: 'server',
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
          )
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.name')
        },
      }),
      getStatusTableColumn({
        minWidth: 180,
        statusModule: 'server',
        slotCallback: row => {
          const log = <side-page-trigger class="ml-1" onTrigger={() => this.handleOpenSidepage(row, 'event-drawer')}>{this.$t('common.view_logs')}</side-page-trigger>
          const cancel = <a class="ml-1"
            onClick={() => this.createDialog('VmLiveMigrateCancelDialog', {
              data: [row],
              columns: this.columns,
              onManager: this.onManager,
            })}>{this.$t('common.cancel')}</a>
          const shutdown = <span class="text-color-help">({this.$t('compute.server.shutdown_mode.stop_charging')})</span>
          const rescue_mode = <span class="text-color-help">({this.$t('compute.rescue')})</span>
          const health = <span style="background:rgb(241, 229, 172);padding:2px 5px;font-size:12px;">{this.$t('compute.health_status.initializing')}</span>

          return [
            <div class='d-flex align-items-center text-truncate'>
              <status status={row.status} statusModule='server' process={row.progress} showStatusProgress={true}>
                {(row.status === 'running' || row.status === 'starting') && row.health_status === 'initializing' ? health : null}
              </status>
              {row.metadata && getToolTip(row)}
              {row.status?.includes('fail') ? log : null}
              {row.status === 'live_migrating' ? cancel : null}
              {row.status === 'ready' && row.shutdown_mode === 'stop_charging' ? shutdown : null}
              {row.rescue_mode === true ? rescue_mode : null}
            </div>,
          ]
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.status')
        },
      }),
      getStatusTableColumn({
        field: 'power_states',
        title: this.$t('compute.power_states'),
        statusModule: 'server',
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.power_states')
        },
      }),
      {
        field: 'is_gpu',
        title: i18nLocale.t('table.title.type'),
        width: 50,
        slots: {
          default: ({ row }) => {
            let tooltip = i18nLocale.t('compute.text_291', [i18nLocale.t('dictionary.server')])
            let icontype = 'cpu'
            if (row.is_gpu) {
              tooltip = `${this.$t('compute.text_113')}${this.$t('dictionary.server')}`
              icontype = 'gpu'
            }
            if (row.backup_host_id) {
              tooltip = this.$t('compute.backup')
              icontype = 'gaokeyong'
            }
            return [<icon type={icontype} style={{ fontSize: '16px' }} title={tooltip} />]
          },
        },
        formatter: ({ row }) => {
          let tooltip = i18nLocale.t('compute.text_291', [i18nLocale.t('dictionary.server')])
          if (row.is_gpu) {
            tooltip = `GPU${this.$t('dictionary.server')}`
          }
          if (row.backup_host_id) {
            tooltip = this.$t('compute.backup')
          }
          return tooltip
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.is_gpu')
        },
      },
      getTagTableColumn({
        onManager: this.onManager,
        resource: 'server',
        columns: () => this.columns,
        tipName: this.$t('dictionary.server'),
        editCheck: (row) => row.hypervisor !== typeClouds.hypervisorMap.bingocloud.key,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.metadata')
        },
      }),
      getIpsTableColumn({
        field: 'ips',
        title: 'IP',
        vm: this,
        sortable: true,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.ips')
        },
      }),
      {
        field: 'macs',
        title: 'MAC',
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.macs) return [<data-loading />]
            if (row.macs) {
              return row.macs.split(',').map(mac => {
                return <list-body-cell-wrap copy row={{ mac }} hide-field field="mac">{mac}</list-body-cell-wrap>
              })
            }
            return []
          },
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.macs')
        },
      },
      getOsArch({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.os_arch')
        },
      }),
      {
        field: 'instance_type',
        title: i18nLocale.t('table.title.flavor'),
        showOverflow: 'ellipsis',
        minWidth: 120,
        sortable: true,
        slots: {
          default: ({ row }) => {
            const ret = []
            if (row.instance_type) {
              ret.push(<div class='text-truncate' style={{ color: '#0A1F44' }}>{row.instance_type}</div>)
            }
            const config = row.vcpu_count + 'C' + (row.vmem_size / 1024) + 'G' + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
            return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{config}</div>)
          },
        },
        formatter: ({ row }) => {
          const ret = []
          if (row.instance_type) {
            ret.push(row.instance_type)
          }
          const config = row.vcpu_count + 'C' + (row.vmem_size / 1024) + 'G' + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
          return ret.concat(config).join(', ')
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.instance_type')
        },
      },
      {
        field: 'os_dist',
        title: i18nLocale.t('table.title.os'),
        width: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            if (!row.metadata) return
            const dist = row.metadata.os_distribution || row.metadata.distro
            const version = row.metadata.os_version || row.metadata.version

            let name = ''
            let tooltip = ''
            if (dist) {
              tooltip = version ? (version.includes(dist) ? version : `${decodeURI(dist)} ${version}`) : dist
            } else if (row.metadata.os_type) {
              tooltip = row.metadata.os_type
            } else if (row.os_type) {
              tooltip = row.os_type
            } else {
              tooltip = i18nLocale.t('compute.text_339')
            }

            name = dist || row.metadata.os_type || row.os_type || ''
            if (name.includes('Windows') || name.includes('windows')) {
              name = 'Windows'
            } else if (name.startsWith('Linux') || name.startsWith('linux')) {
              name = 'Linux'
            } else if (name === 'Others Linux') {
              name = 'Linux'
              tooltip = row.metadata.os_full_name || tooltip
            }
            return [
              <SystemIcon tooltip={tooltip} name={name} />,
            ]
          },
        },
        formatter: ({ row }) => {
          if (!row.metadata) return
          const dist = row.metadata.os_distribution || row.metadata.distro
          const version = row.metadata.os_version || row.metadata.version
          let tooltip = ''

          if (dist) {
            tooltip = version ? (version.includes(dist) ? version : `${decodeURI(dist)} ${version}`) : dist
          } else if (row.metadata.os_type) {
            tooltip = row.metadata.os_type
          } else if (row.os_type) {
            tooltip = row.os_type
          } else {
            tooltip = i18nLocale.t('compute.text_339')
          }

          return tooltip
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.os_type')
        },
      },
      {
        field: 'vcpu_count',
        title: 'CPU',
        sortable: true,
        minWidth: 80,
        slots: {
          default: ({ row }) => {
            if (row.vcpu_count) {
              return [<list-body-cell-wrap row={{ row }} hide-field field="vcpu_count">{row.vcpu_count}</list-body-cell-wrap>]
            }
            return []
          },
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.vcpu_count')
        },
      },
      {
        field: 'vmem_size',
        title: i18nLocale.t('table.title.vmem_size'),
        sortable: true,
        minWidth: 80,
        slots: {
          default: ({ row }) => {
            if (row.vmem_size) {
              const config = (row.vmem_size / 1024) + 'G'
              return [<list-body-cell-wrap row={{ row }} hide-field field="vmem_size">{config}</list-body-cell-wrap>]
            }
            return []
          },
        },
        formatter: ({ row }) => {
          if (row.vmem_size) {
            const config = (row.vmem_size / 1024) + 'G'
            return config
          }
          return ''
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.vmem_size')
        },
      },
      {
        field: 'disk',
        title: i18nLocale.t('table.title.disk'),
        sortable: true,
        minWidth: 80,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.disk) return [<data-loading />]
            const config = row.disk ? sizestr(row.disk, 'M', 1024) : ''
            return [<list-body-cell-wrap row={{ row }} hide-field field="disk">{config}</list-body-cell-wrap>]
          },
        },
        formatter: ({ row }) => {
          if (!row.disk) return ''
          const config = row.disk ? sizestr(row.disk, 'M', 1024) : ''
          return config
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.disk')
        },
      },
      {
        field: 'cpu_usage',
        title: i18nLocale.t('table.title.cpu_usage'),
        sortable: true,
        minWidth: 150,
        hidden: () => true,
        slots: {
          default: ({ row }) => {
            if (row.cpu_usage) {
              return [<a-progress percent={row.cpu_usage.toFixed(4) * 100} size="small" />]
            }
            return [<a-progress percent={0} size="small" />]
          },
        },
      },
      {
        field: 'mem_usage',
        title: i18nLocale.t('table.title.mem_usage'),
        sortable: true,
        minWidth: 150,
        hidden: () => true,
        slots: {
          default: ({ row }) => {
            if (row.mem_usage) {
              return [<a-progress percent={row.mem_usage.toFixed(4) * 100} size="small" />]
            }
            return [<a-progress percent={0} size="small" />]
          },
        },
      },
      {
        field: 'disk_usage',
        title: i18nLocale.t('table.title.disk_usage'),
        sortable: true,
        minWidth: 150,
        hidden: () => true,
        slots: {
          default: ({ row }) => {
            if (row.disk_usage) {
              return [<a-progress percent={row.disk_usage.toFixed(4) * 100} size="small" />]
            }
            return [<a-progress percent={0} size="small" />]
          },
        },
      },
      {
        field: 'password',
        title: i18nLocale.t('table.title.init_keypair'),
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={row.id} resourceType='servers' />]
          },
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.password')
        },
      },
      {
        field: 'secgroups',
        title: i18nLocale.t('res.secgroup'),
        minWidth: 80,
        showOverflow: 'ellipsis',
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.secgroups) return [<data-loading />]
            return row.secgroups?.map(item => item.name).join(',')
          },
        },
        formatter: ({ row }) => {
          return row.secgroups?.map(item => item.name).join(',')
        },
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.secgroups')
        },
      },
      getCopyWithContentTableColumn({
        field: 'vpc',
        title: 'VPC',
        hideField: true,
        slotCallback: (row) => {
          if (this.isPreLoad && !row.vpc) return [<data-loading />]
          return row.vpc
        },
        hidden: () => {
          if (this.$store.getters.isProjectMode) return true
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.vpc')
        },
      }),
      getBillingTableColumn({
        vm: this,
        hiddenSetBtn: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_cancel_expire'),
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.billing_type')
        },
      }),
      getBrandTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.brand')
        },
      }),
      // getCopyWithContentTableColumn({
      //   field: 'account',
      //   title: i18nLocale.t('res.cloudaccount'),
      //   hidden: () => this.$store.getters.isProjectMode,
      // }),
      getAccountTableColumn({
        vm: this,
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.account')
        },
      }),
      {
        field: 'host',
        title: i18nLocale.t('res.host'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            if (this.isPreLoad && !row.host) return [<data-loading />]
            if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public || row.hypervisor === HYPERVISORS_MAP.hcso.hypervisor || row.hypervisor === HYPERVISORS_MAP.hcs.hypervisor) {
              return '-'
            }
            const text = row.host || '-'
            return [
              <list-body-cell-wrap copy field='host' row={row} message={text}></list-body-cell-wrap>,
            ]
          },
        },
        formatter: ({ row }) => {
          if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public) {
            return ''
          }
          return row.host || ''
        },
        hidden: () => {
          if (this.$store.getters.isProjectMode) return true
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.host')
        },
      },
      getProjectTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.tenant')
        },
      }),
      getRegionTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.region')
        },
      }),
      getTimeTableColumn({
        hidden: () => {
          return this.$isScopedPolicyMenuHidden('server_hidden_columns.created_at')
        },
      }),
    ]
    if (this.hideColumnFields) {
      this.columns = columns.filter((column) => { return !this.hideColumnFields.includes(column.field) })
    } else {
      this.columns = columns
    }
  },
}

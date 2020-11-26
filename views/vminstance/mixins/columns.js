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
} from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import { sizestr } from '@/utils/utils'
import { findPlatform } from '@/utils/common/hypervisor'
import i18n from '@/locales'

export default {
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
        const aLink = <a-button type="link" class="oc-pointer" disabled={ this.execLoading } style="padding: 0;" onClick={() => doCreateOrSwitchBackup(row)}>{ this.$t('compute.text_1341') }</a-button>
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
                <template slot="num">{ num }</template>
                <template slot="time">{ time }</template>
                <template slot="link">{ aLink }</template>
              </i18n>
            </template>
            { aIcon }
          </a-tooltip>
        } else if (row.metadata.switch_backup) {
          return <a-tooltip placement="right">
            <template slot="title">
              <i18n path="compute.text_1343">
                <template slot="num">{ num }</template>
                <template slot="time">{ time }</template>
                <template slot="link">{ aLink }</template>
              </i18n>
            </template>
            { aIcon }
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
        addBackup: true,
        formRules: [
          { required: true, message: i18n.t('compute.text_210') },
          { validator: this.$validate('resourceCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({
        minWidth: 130,
        statusModule: 'server',
        slotCallback: row => {
          return [
            <div class='d-flex align-items-center text-truncate'>
              <status status={ row.status } statusModule='server' />
              { row.metadata && getToolTip(row) }
            </div>,
          ]
        },
      }),
      {
        field: 'is_gpu',
        title: i18n.t('table.title.type'),
        width: 50,
        slots: {
          default: ({ row }) => {
            let tooltip = i18n.t('compute.text_291', [i18n.t('dictionary.server')])
            let icontype = 'cpu'
            if (row.is_gpu) {
              tooltip = `GPU${this.$t('dictionary.server')}`
              icontype = 'gpu'
            }
            return [<icon type={icontype} style={{ fontSize: '16px' }} title={tooltip} />]
          },
        },
      },
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'server', columns: () => this.columns, tipName: this.$t('dictionary.server') }),
      getIpsTableColumn({ field: 'ip', title: 'IP', vm: this }),
      getCopyWithContentTableColumn({
        field: 'macs',
        title: 'MAC',
      }),
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
        field: 'password',
        title: i18n.t('table.title.init_keypair'),
        minWidth: 50,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
          },
        },
      },
      {
        field: 'secgroups',
        title: i18n.t('res.secgroup'),
        minWidth: 80,
        showOverflow: 'ellipsis',
        formatter: ({ cellValue = [] }) => {
          return cellValue.map(item => item.name).join(',')
        },
      },
      getCopyWithContentTableColumn({
        field: 'vpc',
        title: 'VPC',
        hidden: () => this.$store.getters.isProjectMode,
      }),
      getBillingTableColumn({ vm: this, hiddenSetBtn: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_cancel_expire') }),
      getBrandTableColumn(),
      getCopyWithContentTableColumn({
        field: 'account',
        title: i18n.t('res.cloudaccount'),
        hidden: () => this.$store.getters.isProjectMode,
      }),
      {
        field: 'host',
        title: i18n.t('res.host'),
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public) {
              return '-'
            }
            const text = row.host || '-'
            return [
              <list-body-cell-wrap copy field='host' row={row} message={text}></list-body-cell-wrap>,
            ]
          },
        },
        hidden: () => this.$store.getters.isProjectMode,
      },
      getProjectTableColumn(),
      getRegionTableColumn(),
      getTimeTableColumn(),
    ]
    if (this.hideColumnFields) {
      this.columns = columns.filter((column) => { return !this.hideColumnFields.includes(column.field) })
    } else {
      this.columns = columns
    }
  },
}

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
} from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import { sizestr } from '@/utils/utils'
import { findPlatform } from '@/utils/common/hypervisor'
import { hasPermission } from '@/utils/auth'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        addBackup: true,
        formRules: [
          { required: true, message: '请输入名称' },
          { validator: this.$validate('serverCreateName') },
        ],
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      {
        field: 'is_gpu',
        title: '类型',
        width: 50,
        slots: {
          default: ({ row }) => {
            let tooltip = '通用云服务器'
            let icontype = 'cpu'
            if (row.is_gpu) {
              tooltip = 'GPU云服务器'
              icontype = 'gpu'
            }
            return [
              <a-tooltip placement="top" title={tooltip}>
                <icon type={icontype} style={{ fontSize: '16px' }} />
              </a-tooltip>,
            ]
          },
        },
      },
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'server', columns: () => this.columns }),
      getIpsTableColumn({ field: 'ip', title: 'IP' }),
      {
        field: 'instance_type',
        title: '配置',
        showOverflow: 'ellipsis',
        minWidth: 120,
        sortable: true,
        slots: {
          default: ({ row }) => {
            let ret = []
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
        title: '系统',
        width: 50,
        slots: {
          default: ({ row }) => {
            let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
            if (name.includes('Windows') || name.includes('windows')) {
              name = 'Windows'
            }
            const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
            const tooltip = (version.includes(name) ? version : `${name} ${version}`) || '未知' // 去重
            return [
              <SystemIcon tooltip={ tooltip } name={ name } />,
            ]
          },
        },
      },
      {
        field: 'password',
        title: '密码',
        width: 50,
        slots: {
          default: ({ row }) => {
            return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
          },
        },
      },
      {
        field: 'secgroups',
        title: '安全组',
        width: 80,
        showOverflow: 'ellipsis',
        formatter: ({ cellValue = [] }) => {
          return cellValue.map(item => item.name).join(',')
        },
      },
      getBillingTableColumn({ vm: this }),
      getStatusTableColumn({ statusModule: 'server' }),
      getCopyWithContentTableColumn({ field: 'vpc', title: 'VPC' }),
      {
        field: 'host',
        title: '宿主机',
        sortable: true,
        showOverflow: 'ellipsis',
        minWidth: 100,
        slots: {
          default: ({ row }) => {
            if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public) {
              return '-'
            }
            const text = row['host'] || '-'
            return [
              <list-body-cell-wrap copy field='host' row={row} message={text}></list-body-cell-wrap>,
            ]
          },
        },
      },
      getCopyWithContentTableColumn({ field: 'account', title: '云账号' }),
      getProjectTableColumn(),
      getBrandTableColumn(),
      getRegionTableColumn(),
    ]
  },
}

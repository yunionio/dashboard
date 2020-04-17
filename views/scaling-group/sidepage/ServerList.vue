<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getNameDescriptionTableColumn, getTimeTableColumn, getStatusTableColumn, getIpsTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getEnabledFilter } from '@/utils/common/tableFilter'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SystemIcon from '@/sections/SystemIcon'
import ListMixin from '@/mixins/list'

export default {
  name: 'ScalingGroupServerListSidePage',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servers',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('server'),
          enabled: getEnabledFilter(),
        },
      }),
      columns: [
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
              <side-page-trigger permission="server_get" name="VmInstanceSidePage" id={row.id} vm={this}>{ row.name }</side-page-trigger>
            )
          },
        }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
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
        getStatusTableColumn({ field: 'scaling_status', title: '状态', statusModule: 'scalingserver' }),
        getStatusTableColumn({ title: '主机状态', statusModule: 'server' }),
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
        getTimeTableColumn(),
        {
          field: 'host',
          title: '宿主机',
          width: 120,
        },
        getCopyWithContentTableColumn({ field: 'account', title: '云账号' }),
      ],
      singleActions: [
        {
          label: '移除',
          action: (row) => {
            this.createDialog('ScalingGroupServerRemoveDialog', {
              title: '移除',
              data: [row],
              resId: this.getParams.scaling_group,
              columns: this.columns,
              refresh: this.refresh,
              onManager: this.onManager,
            })
          },
        },
      ],
      groupActions: [
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { SERVER_TYPE } from '@Compute/constants'
import { getNameDescriptionTableColumn, getTimeTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getEnabledFilter, getHostFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import SystemIcon from '@/sections/SystemIcon'
import ListMixin from '@/mixins/list'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'RelatedResourceServerListSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
    },
  },
  data () {
    const labels = this.data.labels || []
    return {
      list: this.$list.createList(this, {
        id: this.id,
        key: 'id',
        resource: 'servers',
        getParams: {
          filter: `id.in(${labels.join(',')})`,
        },
        steadyStatus: Object.values(expectStatus.scalingserver).flat().concat(Object.values(expectStatus.server).flat()),
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
          host: getHostFilter(),
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
        getStatusTableColumn({ title: '状态', statusModule: 'server', width: 130 }),
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
          sortable: true,
          showOverflow: 'ellipsis',
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public) {
                return '-'
              }
              const text = row['host'] || '-'
              return text
            },
          },
        },
      ],
      singleActions: [
        {
          label: '解绑',
          action: (row) => {
            this.createDialog('RelatedResourceServerRemoveDialog', {
              title: '解绑',
              data: [row],
              resData: this.data,
              columns: this.columns,
              refresh: this.refresh,
              onManager: this.onManager,
              success: (labels) => {
                this.list.getParams = {
                  filter: `id.in(${labels.join(',')})`,
                }
                this.list.fetchData()
              },
            })
          },
        },
      ],
      groupActions: [],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

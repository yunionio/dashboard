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
import { SERVER_TYPE } from '@Compute/constants'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getNameDescriptionTableColumn, getTimeTableColumn, getStatusTableColumn, getIpsTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getEnabledFilter, getHostFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SystemIcon from '@/sections/SystemIcon'
import ListMixin from '@/mixins/list'
import { findPlatform } from '@/utils/common/hypervisor'

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
        id: 'ServerListForScalingGroupSidePage',
        key: 'id',
        resource: 'servers',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.scalingserver).flat().concat(Object.values(expectStatus.server).flat()),
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
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
            { required: true, message: this.$t('compute.text_210') },
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
          title: this.$t('table.title.os'),
          width: 50,
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = (version.includes(name) ? version : `${name} ${version}`) || this.$t('compute.text_339') // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        {
          field: 'password',
          title: this.$t('compute.text_340'),
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='servers' />]
            },
          },
        },
        getStatusTableColumn({ field: 'scaling_status', title: this.$t('compute.text_268'), statusModule: 'scalingserver' }),
        getStatusTableColumn({ title: this.$t('compute.text_973'), statusModule: 'server', width: 130 }),
        {
          field: 'instance_type',
          title: this.$t('compute.text_295'),
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
        getTimeTableColumn(),
        {
          field: 'host',
          title: this.$t('compute.text_111'),
          sortable: true,
          showOverflow: 'ellipsis',
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              if (findPlatform(row.hypervisor, 'hypervisor') === SERVER_TYPE.public) {
                return '-'
              }
              const text = row.host || '-'
              return text
            },
          },
        },
        getCopyWithContentTableColumn({ field: 'account', title: this.$t('compute.text_269') }),
      ],
      singleActions: [
        {
          label: this.$t('compute.text_950'),
          action: (row) => {
            this.createDialog('ScalingGroupServerRemoveDialog', {
              title: this.$t('compute.text_950'),
              data: [row],
              resId: this.data.id,
              columns: this.columns,
              refresh: this.refresh,
              onManager: this.onManager,
            })
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('compute.text_950'),
          action: (row) => {
            this.createDialog('ScalingGroupServerRemoveDialog', {
              title: this.$t('compute.text_950'),
              data: this.list.selectedItems,
              resId: this.data.id,
              columns: this.columns,
              refresh: this.refresh,
              onManager: this.onManager,
            })
          },
          meta: (row) => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>

<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { SERVER_TYPE } from '@Compute/constants'
import { getNameDescriptionTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
import { getStatusFilter, getHostFilter } from '@/utils/common/tableFilter'
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
    params: {
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
          ...this.params,
        },
        steadyStatus: Object.values(expectStatus.scalingserver).flat().concat(Object.values(expectStatus.server).flat()),
        filterOptions: {
          name: {
            label: this.$t('cloudenv.text_95'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('server'),
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
            { required: true, message: this.$t('cloudenv.text_190') },
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
          title: this.$t('cloudenv.text_457'),
          width: 50,
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = (version.includes(name) ? version : `${name} ${version}`) || this.$t('cloudenv.text_458') // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        getStatusTableColumn({ title: this.$t('cloudenv.text_98'), statusModule: 'server', width: 130 }),
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
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        {
          field: 'isolated_time',
          title: this.$t('cloudenv.text_460'),
          minWidth: 100,
          formatter: ({ row }) => {
            const labelDetails = this.data.label_details
            const label = labelDetails.find((item) => item.label === row.id) || {}
            return this.$moment(label.isolated_time).format() || '-'
          },
        },
        {
          field: 'host',
          title: this.$t('cloudenv.text_101'),
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
      ],
      singleActions: [
        {
          label: this.$t('cloudenv.text_452'),
          permission: 'scheduledtasks_perform_set_label',
          action: (row) => {
            this.createDialog('RelatedResourceRemoveDialog', {
              title: this.$t('cloudenv.text_452'),
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
      groupActions: [
        {
          label: this.$t('cloudenv.text_454'),
          permission: 'scheduledtasks_perform_set_label',
          action: () => {
            this.createDialog('ScheduledtaskEditDialog', {
              data: [this.data],
              columns: this.columns,
              onManager: this.onManager,
              title: this.$t('cloudenv.text_454'),
              success: (labels) => {
                this.list.getParams = {
                  filter: `id.in(${labels.join(',')})`,
                }
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('cloudenv.text_452'),
          permission: 'scheduledtasks_perform_set_label',
          action: () => {
            this.createDialog('RelatedResourceRemoveDialog', {
              title: this.$t('cloudenv.text_452'),
              data: this.list.selectedItems,
              resData: this.data,
              columns: this.columns,
              // refresh: this.refresh,
              onManager: this.onManager,
              success: (labels) => {
                this.list.getParams = {
                  filter: `id.in(${labels.join(',')})`,
                }
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            const ret = {
              validate: false,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('RelatedResourceServerListSidePageRefresh', labels => {
      this.list.getParams = {
        filter: `id.in(${labels.join(',')})`,
      }
      this.list.fetchData()
    }, this)
  },
}
</script>

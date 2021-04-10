<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getCopyWithContentTableColumn, getNameDescriptionTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
import SystemIcon from '@/sections/SystemIcon'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'VMInstanceListForInstanceGroup',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'VminstanceListForInstanceGroupSidepage',
        resource: 'servers',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.server).flat(),
        filterOptions: {
          name: {
            label: this.$t('compute.text_719'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: {
            label: this.$t('compute.text_353'),
            dropdown: true,
            multiple: true,
            items: [
              { label: this.$t('compute.text_574'), key: 'running' },
              { label: this.$t('compute.text_273'), key: 'ready' },
              { label: this.$t('compute.text_339'), key: 'unknown' },
              { label: this.$t('compute.text_720'), key: 'sched_fail' },
            ],
            filter: true,
            formatter: val => {
              return `status.in(${val.join(',')})`
            },
          },
          os_type: {
            label: this.$t('compute.text_721'),
            dropdown: true,
            multiple: true,
            items: [
              { label: 'Windows', key: 'windows' },
              { label: 'Linux', key: 'linux' },
              { label: 'VMware', key: 'VMWare' },
            ],
            filter: true,
            formatter: val => {
              return `os_type.contains("${val}")`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({ addLock: true, vm: this }),
        {
          field: 'os_type',
          title: this.$t('table.title.os'),
          width: 50,
          slots: {
            default: ({ row }) => {
              let name = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const version = (row.metadata && row.metadata.os_version) ? `${row.metadata.os_version}` : ''
              const tooltip = version.includes(name) ? version : `${name} ${version}` // 去重
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        getStatusTableColumn({ statusModule: 'server' }),
        {
          field: 'instance_type',
          title: this.$t('compute.text_295'),
          showOverflow: 'ellipsis',
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.instance_type) {
                ret.push(<div style={{ color: '#0A1F44' }}>{ row.instance_type }</div>)
              }
              const config = row.vcpu_count + 'C' + sizestr(row.vmem_size, 'M', 1024) + (row.disk ? sizestr(row.disk, 'M', 1024) : '')
              return ret.concat(<div style={{ color: '#53627C' }}>{ config }</div>)
            },
          },
        },
        getTimeTableColumn({
          field: 'attach_time',
          title: this.$t('compute.text_722'),
        }),
        getCopyWithContentTableColumn({ field: 'host', title: this.$t('compute.text_111') }),
      ],
      groupActions: [
        {
          label: this.$t('compute.text_723'),
          action: () => {
            this.createDialog('InstanceGroupUnbindServerDialog', {
              instanceGroupId: this.resId,
              columns: this.columns,
              data: this.list.selectedItems,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_723'),
          action: obj => {
            this.createDialog('InstanceGroupUnbindServerDialog', {
              instanceGroupId: this.resId,
              columns: this.columns,
              data: [obj],
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('VMInstanceListForInstanceGroupRefreshList', () => {
      this.list.refresh()
    }, this)
  },
  methods: {
    getParams () {
      return {
        details: true,
        with_meta: true,
        filter: 'hypervisor.notin(baremetal,container)',
        group: this.resId,
      }
    },
  },
}
</script>

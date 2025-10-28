<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import {
  getProjectTableColumn,
  getRegionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getIpsTableColumn,
  getTagTableColumn,
  getNameDescriptionTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { cloudEnabled, cloudUnabledTip } from '@Compute/views/vminstance-container/utils'

const commonUnabled = (value, statusArr = ['sched_fail', 'net_fail', 'disk_fail']) => {
  return statusArr.includes(value.status)
}

export default {
  name: 'VmContainerListForGpuSidePage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'VmContainerListForGpuSidePage',
        resource: 'servers',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
        steadyStatus: Object.values(expectStatus.container).flat(),
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
          addBackup: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'VmContainerInstanceSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getTagTableColumn({ onManager: this.onManager, resource: 'server', columns: () => this.columns }),
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
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
        {
          field: 'secgroups',
          title: this.$t('compute.text_105'),
          width: 80,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue = [] }) => {
            return cellValue.map(item => item.name).join(',')
          },
        },
        {
          field: 'billing_type',
          title: this.$t('compute.text_498'),
          width: 100,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.billing_type === 'postpaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>{this.$t('billingType.postpaid')}</div>)
              } else if (row.billing_type === 'prepaid') {
                ret.push(<div style={{ color: '#0A1F44' }}>{this.$t('billingType.postpaid')}</div>)
              }
              if (row.expired_at) {
                const dateArr = this.$moment(row.expired_at).fromNow().split(' ')
                const date = dateArr.join(' ')
                const seconds = this.$moment(row.expired_at).diff(new Date()) / 1000
                const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
                const text = seconds < 0 ? this.$t('compute.text_499') : this.$t('compute.text_500', [date])
                ret.push(<div style={{ color: textColor }}>{ text }</div>)
              }
              return ret
            },
          },
        },
        getStatusTableColumn({ statusModule: 'container' }),
        getCopyWithContentTableColumn({ field: 'host', title: this.$t('compute.text_111'), sortable: true }),
        getProjectTableColumn(),
        getBrandTableColumn(),
        getRegionTableColumn(),
      ],
      groupActions: [
        {
          label: this.$t('compute.text_483', [this.$t('dictionary.server_container')]),
          permission: 'server_perform_attach_isolated_device',
          action: obj => {
            this.createDialog('GpuAttachServerDialog', {
              data: [this.data],
              title: this.$t('compute.text_483', [this.$t('dictionary.server_container')]),
              columns: this.columns,
              refresh: this.refresh,
              resourceType: 'server_container',
            })
          },
          meta: obj => {
            const ret = { validate: true }
            if (this.data.dev_type === 'NIC') {
              ret.validate = false
              ret.tooltip = this.$t('compute.sriov_device_nic_notsupport')
              return ret
            }
            if (this.data.guest_id) {
              ret.validate = false
              return ret
            }
            ret.validate = true
            return ret
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('compute.text_272'),
          permission: 'server_perform_start',
          action: (obj) => {
            this.list.onManager('performAction', {
              steadyStatus: 'running',
              id: obj.id,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: (obj) => {
            return {
              validate: obj.status === 'ready' && !commonUnabled(obj),
            }
          },
        },
        {
          label: this.$t('compute.text_273'),
          permission: 'server_perform_stop',
          action: (obj) => {
            this.createDialog('VmShutDownDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
              name: this.$t('compute.vminstance-container'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => {
            return {
              validate: obj.status === 'running' && !commonUnabled(obj),
            }
          },
        },
        {
          label: this.$t('compute.text_260', [this.$t('compute.text_113')]),
          permission: 'server_perform_detach_isolated_device',
          action: obj => {
            this.createDialog('DetachGpuDialog', {
              data: [obj],
              title: this.$t('compute.text_485', [this.$t('compute.text_113')]),
              columns: this.columns,
              refresh: this.refresh,
              name: this.$t('dictionary.server_container'),
              device: this.data,
            })
          },
          meta: obj => {
            const ret = { validate: true }

            if (this.data.dev_type === 'NIC') {
              ret.validate = false
              ret.tooltip = this.$t('compute.sriov_device_nic_notsupport')
              return ret
            }

            if (obj.status !== 'ready') {
              ret.validate = false
              ret.tooltip = this.$t('compute.text_489_1', [this.$t('compute.text_113')])
              return ret
            }
            ret.validate = cloudEnabled('acttachGpu', obj)
            ret.tooltip = cloudUnabledTip('acttachGpu', obj)
            return ret
          },
        },
      ],
    }
  },
  watch: {
    'data.guest_id': {
      handler (val) {
        this.list.fetchData()
      },
    },
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    refresh () {
      this.$bus.$emit('gpu-sidepage-refresh')
    },
    getParam () {
      return {
        'filter.0': `id.equals(${this.data.guest_id})`,
        'filter.1': 'hypervisor.in(pod)',
      }
    },
  },
}
</script>

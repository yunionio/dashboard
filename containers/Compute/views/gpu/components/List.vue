<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :show-single-actions="!isTemplate"
    :show-page="!isTemplate"
    :group-actions="getFinalGroupActions(groupActions)"
    :single-actions="getFinalSingleActions(singleActions)"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
// import { isUpdatableGpuType } from '@Compute/constants'
import { getNameFilter, getRegionFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'GpuList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    gpuResource: String,
    data: Object, // guest data
    resId: String,
    probeHostDevices: Boolean,
    hiddenActionKeys: Array,
  },
  data () {
    const filter = {}
    if (!this.inBaseSidePage) {
      if (this.$route.query.id) {
        filter.id = [this.$route.query.id]
      }
      if (this.$route.query.hasOwnProperty('is_associated')) {
        filter.is_associated = [this.$route.query.is_associated]
      }
    }
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: this.gpuResource || 'isolated_devices',
        getParams: this.getParam,
        filter,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          dev_type: {
            label: this.$t('compute.text_481'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'dev_type',
            },
          },
          model: {
            label: this.$t('compute.text_482'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'model',
            },
          },
          vendor: {
            label: this.$t('compute.isolated_devices.vendor.title'),
            dropdown: true,
            multiple: true,
            items: [
              { label: 'NVIDIA', key: 'NVIDIA' },
              { label: 'AMD', key: 'AMD' },
              { label: 'HYGON', key: 'HYGON' },
              { label: 'VASTAITECH', key: 'VASTAITECH' },
            ],
          },
          vendor_device_id: {
            label: this.$t('compute.isolated_devices.vendor_device_id.title'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'vendor_device_id',
            },
          },
          addr: {
            label: 'PCI ADDR',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'addr',
            },
          },
          device_path: {
            label: this.$t('compute.isolated_devices.device_path.title'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'device_path',
            },
          },
          numa_node: {
            label: 'NUMA',
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'numa_node',
            },
          },
          guest: {
            label: this.$t('compute.text_483', [this.$t('dictionary.server')]),
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `servers.id(guest_id).name.contains("${val}")`
            },
          },
          is_associated: {
            label: this.$t('network.is_associated'),
            dropdown: true,
            items: [
              { label: this.$t('network.associated'), key: 'true' },
              { label: this.$t('network.un_associated'), key: 'false' },
            ],
            filter: true,
            formatter: (val) => {
              return val[0] === 'true' ? 'guest_id.isnotempty()' : 'guest_id.isnullorempty()'
            },
          },
          host: {
            label: this.$t('compute.text_484'),
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `hosts.id(host_id).name.contains("${val}")`
            },
          },
          region: getRegionFilter(),
          zone: {
            label: this.$t('dictionary.zone'),
          },
        },
        steadyStatus: {
          guest_status: [...Object.values(expectStatus.server).flat(), '', undefined],
        },
      }),
      groupActions: [
        {
          label: this.$t('compute.text_485', [this.$t('dictionary.server')]),
          permission: 'server_perform_detach_isolated_device',
          action: () => {
            this.createDialog('DetachGpuDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_485', [this.$t('dictionary.server')]),
              name: this.$t('compute.text_113'),
              refresh: this.refresh,
              devices: this.list.selectedItems,
            })
          },
          meta: () => {
            const item = this.list.selectedItems
            if (item.length <= 0) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_486'),
              }
            }
            const someNicDevice = item.some(v => v.dev_type === 'NIC')
            if (someNicDevice) {
              return {
                validate: !someNicDevice,
                tooltip: this.$t('compute.sriov_device_nic_notsupport'),
              }
            }
            if (this.gpuResource) {
              const status = this.data?.status
              const noValidateGuestStatus = item.some(v => v.host_type !== 'container') && status !== 'ready' && status !== 'running' && status !== 'unknown'
              const noValidateContainerStatus = item.some(v => v.host_type === 'container') && status !== 'ready' && status !== 'unknown'
              if (noValidateGuestStatus) {
                return {
                  validate: false,
                  tooltip: this.$t('compute.text_489', [this.$t('dictionary.server')]),
                }
              }
              if (noValidateContainerStatus) {
                return {
                  validate: false,
                  tooltip: this.$t('compute.text_489_1', [this.$t('compute.text_113')]),
                }
              }
              return { validate: true }
            }
            const isGuestStatusInvalid = (statuses) => {
              const list = Array.isArray(statuses) ? statuses : [statuses]
              return list.some(s => s !== 'ready' && s !== 'running' && s !== 'unknown')
            }
            const isContainerStatusInvalid = (statuses) => {
              const list = Array.isArray(statuses) ? statuses : [statuses]
              return list.some(s => s !== 'ready' && s !== 'unknown')
            }
            const noValidateGuestStatus = item.some(v => v.host_type !== 'container' && isGuestStatusInvalid(v.guest_status))
            const noValidateContainerStatus = item.some(v => v.host_type === 'container' && isContainerStatusInvalid(v.guest_status))
            const validateGuest = item.every(v => Array.isArray(v.guest) ? v.guest.length > 0 : !!v.guest)
            if (!validateGuest) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_487', [this.$t('dictionary.server')]),
              }
            }
            if (noValidateGuestStatus) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_489', [this.$t('dictionary.server')]),
              }
            }
            if (noValidateContainerStatus) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_489_1', [this.$t('compute.text_113')]),
              }
            }
            return { validate: true }
          },
        },
        {
          key: 'SetReserveResource',
          label: this.$t('compute.text_490'),
          permission: 'isolated_devices_update',
          action: () => {
            this.createDialog('SetReserveResourceDialog', {
              onManager: this.onManager,
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const item = this.list.selectedItems
            if (item.length <= 0) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_491'),
              }
            }
            let otherType = ''
            item.map(obj => {
              if (obj.dev_type && obj.dev_type.indexOf('GPU') === -1) {
                otherType = obj.dev_type
              }
            })
            if (otherType) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_1398', [otherType]),
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: this.$t('gpu.device_type.update'),
          action: obj => {
            this.createDialog('UpdateDeviceTypeDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: obj => {
            const ret = { validate: true }
            const isSelected = this.list.selectedItems?.length > 0
            if (!isSelected) {
              ret.validate = false
              ret.tooltip = this.$t('gpu.device_type.update.tooltip')
              return ret
            }
            const isAllGPU = this.list.selectedItems.every(o => o.dev_type.indexOf('GPU') !== -1)
            if (!isAllGPU) {
              ret.validate = false
              ret.tooltip = this.$t('gpu.device_type.gpu.tooltip')
              return ret
            }
            // const isGpuHpcOrVga = this.list.selectedItems.every(o => isUpdatableGpuType(o))
            // if (!isGpuHpcOrVga) {
            //   ret.validate = false
            //   ret.tooltip = this.$t('gpu.device_type.tooltip.check_hpc_vga_gpu')
            //   return ret
            // }
            return ret
          },
        },
        {
          label: this.$t('compute.host_probe_isolated_devices'),
          permission: 'hosts_perform_probe_isolated_devices',
          action: () => {
            this.updateHostProbeIsolatedDevices()
          },
          hidden: () => !this.probeHostDevices,
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        items: this.columns,
        title: this.$t('compute.text_113'),
      }
    },
  },
  created () {
    this.$bus.$on('gpu-sidepage-refresh', () => {
      this.list.refresh()
    })
    this.init()
    this.list.fetchData().then(() => {
      this.$nextTick(() => {
        if (this.$route.query.id && this.list.data[this.$route.query.id]) {
          this.handleOpenSidepage(this.list.data[this.$route.query.id].data)
        }
      })
    })
  },
  methods: {
    getParam () {
      const ret = {
        show_baremetal_isolated_devices: false,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        with_meta: true,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.initSidePageTab(tab)
      this.sidePageTriggerHandle(this, 'GpuSidePage', {
        id: row.id,
        resource: 'isolated_devices',
        getParams: this.getParam,
        currentTab: 'servers-list',
      }, {
        list: this.list,
      })
    },
    async init () {
      this.list.fetchData()
    },
    async updateHostProbeIsolatedDevices () {
      const loading = this.$message.loading(this.$t('compute.host_probe_isolated_devices'), 0)
      try {
        new this.$Manager('hosts', 'v1').performAction({
          id: this.resId,
          action: 'probe-isolated-devices',
        }).then(res => {
          this.list.refresh()
          loading()
        })
      } catch (err) {
        loading()
        throw err
      }
    },
    getFinalGroupActions () {
      if (this.hiddenActionKeys?.length > 0) {
        return this.groupActions.filter(o => !this.hiddenActionKeys.includes(o.key))
      }
      return this.groupActions
    },
    getFinalSingleActions () {
      if (this.hiddenActionKeys?.length > 0) {
        return this.singleActions.filter(o => !this.hiddenActionKeys.includes(o.key))
      }
      return this.singleActions
    },
  },
}
</script>

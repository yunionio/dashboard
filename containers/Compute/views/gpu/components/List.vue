<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="getFinalGroupActions(groupActions)"
    :single-actions="getFinalSingleActions(singleActions)"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { GPU_DEV_TYPE_OPTION_MAP } from '@Compute/constants'
import { getNameFilter, getRegionFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'GpuList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    resId: String,
    probeHostDevices: Boolean,
    hiddenActionKeys: Array,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'isolated_devices',
        getParams: this.getParam,
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          dev_type: {
            label: this.$t('compute.text_481'),
            filter: true,
            formatter: val => {
              return `dev_type.contains("${val}")`
            },
          },
          model: {
            label: this.$t('compute.text_482'),
            filter: true,
            formatter: val => {
              return `model.contains("${val}")`
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
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_482'), key: 'model' },
          { label: this.$t('compute.text_483', [this.$t('dictionary.server')]), key: 'guest' },
          { label: this.$t('compute.text_484'), key: 'host' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_485', [this.$t('dictionary.server')]),
          permission: 'server_perform_detach_isolated_device',
          action: () => {
            this.createDialog('DetachGpuDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_485', [this.$t('dictionary.server')]),
              refresh: this.refresh,
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
            const validateGuestStatus = item.every(item => item.guest_id && (item.guest_status === 'ready' || item.guest_status === 'running'))
            const validateGuestId = item.every(item => item.guest_id)
            const someNicDevice = item.some(v => v.dev_type === 'NIC')
            if (someNicDevice) {
              return {
                validate: !someNicDevice,
                tooltip: this.$t('compute.sriov_device_nic_notsupport'),
              }
            }
            if (!validateGuestId) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_487', [this.$t('dictionary.server')]),
              }
            }
            if (!validateGuestStatus) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_489', [this.$t('dictionary.server')]),
              }
            }
            return {
              validate: true,
            }
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
            const isGpuHpcOrVga = this.list.selectedItems.every(o => {
              return o.dev_type === GPU_DEV_TYPE_OPTION_MAP['GPU-HPC'].value || o.dev_type === GPU_DEV_TYPE_OPTION_MAP['GPU-VGA'].value
            })
            if (!isGpuHpcOrVga) {
              ret.validate = false
              ret.tooltip = this.$t('gpu.device_type.tooltip.check_hpc_vga_gpu')
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.init()
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
      if (this.resId) {
        if (this.probeHostDevices) {
          await this.updateHostProbeIsolatedDevices()
        }
      }
      await this.list.fetchData()
    },
    async updateServerProbeIsolatedDevices () {
      try {
        await new this.$Manager('servers', 'v1').performAction({
          id: this.resId,
          action: 'probe-isolated-devices',
        })
      } catch (err) {
        throw err
      }
    },
    async updateHostProbeIsolatedDevices () {
      try {
        await new this.$Manager('hosts', 'v1').performAction({
          id: this.resId,
          action: 'probe-isolated-devices',
        })
      } catch (err) {
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

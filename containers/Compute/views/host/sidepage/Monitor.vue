<template>
  <div>
    <template v-if="isContainerHost">
      <a-tabs default-active-key="basic" @change="handleTabChange">
        <a-tab-pane key="basic" :tab="$t('compute.monitor.basic')">
          <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
        </a-tab-pane>
        <a-tab-pane key="gpu" :tab="$t('compute.monitor.gpu')">
          <a-spin v-if="gpuLoading" />
          <a-empty
            v-else-if="!gpuHasDevices"
            :description="$t('compute.monitor.gpu.no_isolated_device')" />
          <a-empty
            v-else-if="!gpuLocalPanels.length"
            :description="$t('compute.monitor.gpu.no_matched_vendor')" />
          <dashboard-cards
            v-else
            ref="gpuDashboardCards"
            useLocalPanels
            :extraParams="extraParams"
            :localPanels="gpuLocalPanels" />
        </a-tab-pane>
      </a-tabs>
    </template>
    <dashboard-cards v-else ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
  </div>
</template>

<script>
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { buildGpuMonitorOpts, getGpuVendorKeysFromDevices } from '@Compute/constants/gpuMonitor'
import WindowsMixin from '@/mixins/windows'
import { KVM_MONITOR_OPTS, VMWARE_MONITOR_OPTS, NIC_RSRC_MON_OPTS, RADEONTOP_OPTS, VASMI_OPTS, HYSMI_OPTS } from '../constants'
export default {
  name: 'HostMonitorSidepage',
  components: {
    DashboardCards,
  },
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    needFetchResource: {
      type: Boolean,
      default: false,
    },
    forceKvm: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      host: this.data,
      singleActions: [],
      gpuLoading: false,
      gpuHasDevices: false,
      gpuVendorKeys: [],
    }
  },
  computed: {
    hostType () {
      return this.host.host_type
    },
    isContainerHost () {
      return this.hostType === 'container'
    },
    isolatedDeviceTypes () {
      return Object.keys(this.host.isolated_device_type_count || {})
    },
    monitorConstants () {
      if (this.forceKvm) {
        return [...KVM_MONITOR_OPTS]
      }
      let list = VMWARE_MONITOR_OPTS
      if ((this.hostType === 'hypervisor' || this.hostType === 'container') && !this.host.manager_id) {
        list = [...KVM_MONITOR_OPTS]
        if (this.isolatedDeviceTypes.some(type => ['NETINT_CA_QUADRA', 'NETINT_CA_ASIC'].includes(type))) {
          list = [...list, ...NIC_RSRC_MON_OPTS]
        }
        if (this.isolatedDeviceTypes.some(type => ['CPH_AMD_GPU'].includes(type))) {
          list = [...list, ...RADEONTOP_OPTS]
        }
        if (this.isolatedDeviceTypes.some(type => ['VASTAITECH_GPU'].includes(type))) {
          list = [...list, ...VASMI_OPTS]
        }
        // 容器宿主机 GPU 指标统一放到 GPU 监控 Tab
        if (!this.isContainerHost && this.isolatedDeviceTypes.some(type => ['HYGON_DCU', 'HYGON_DCU_HAMI'].includes(type))) {
          list = [...list, ...HYSMI_OPTS]
        }
      }
      return list
    },
    hostId () {
      return this.host.id
    },
    localPanels () {
      return this.monitorConstants.map(item => {
        return {
          panel_name: `${item.label}${item.metric ? `(${item.metric})` : `(${item.fromItem}.${item.seleteItem})`}`,
          constants: item,
          queryData: this.genQueryData(item),
        }
      })
    },
    gpuMonitorConstants () {
      return buildGpuMonitorOpts('host', this.gpuVendorKeys)
    },
    gpuLocalPanels () {
      return this.gpuMonitorConstants.map(item => {
        return {
          panel_name: `${item.label}${item.metric ? `(${item.metric})` : `(${item.fromItem}.${item.seleteItem})`}`,
          constants: item,
          queryData: this.genQueryData(item),
        }
      })
    },
  },
  watch: {
    hostId: {
      handler (val) {
        if (val && this.isContainerHost) {
          this.fetchGpuIsolatedDevices()
        }
      },
      immediate: true,
    },
  },
  created () {
    this.$bus.$on('VmMonitorTypeChange', (tab) => {
      this.$refs.dashboardCards && this.$refs.dashboardCards.initMonitorConfig()
      this.$refs.gpuDashboardCards && this.$refs.gpuDashboardCards.initMonitorConfig()
    })
  },
  methods: {
    async fetchGpuIsolatedDevices () {
      if (!this.hostId) return
      this.gpuLoading = true
      try {
        // 与宿主机详情透传设备列表一致：isolated_devices + host_id
        const { data: { data = [] } } = await new this.$Manager('isolated_devices').list({
          params: {
            host: this.hostId,
            host_id: this.hostId,
            details: true,
            with_meta: true,
            limit: 0,
            scope: this.$store.getters.scope,
          },
        })
        this.gpuHasDevices = data.length > 0
        this.gpuVendorKeys = getGpuVendorKeysFromDevices(data)
      } catch (e) {
        this.gpuHasDevices = false
        this.gpuVendorKeys = []
      } finally {
        this.gpuLoading = false
      }
    },
    handleTabChange () {
      this.$nextTick(() => {
        this.$refs.dashboardCards && this.$refs.dashboardCards.initMonitorConfig()
        this.$refs.gpuDashboardCards && this.$refs.gpuDashboardCards.initMonitorConfig()
      })
    },
    genQueryData (val) {
      const opt = val
      if (!val.extraTags) {
        val.extraTags = []
      }
      let select = []
      if (val.as) {
        const asItems = val.as.split(',')
        select = val.seleteItem.split(',').map((val, i) => {
          return [
            {
              type: 'field',
              params: [val],
            },
            { // 对应 mean(val.seleteItem)
              type: opt.groupFunc || opt.selectFunction || 'mean',
              params: [],
            },
            { // 确保后端返回columns有 val.label 的别名
              type: 'alias',
              params: [asItems[i]],
            },
          ]
        })
      } else {
        select = val.seleteItem.split(',').map((val, i) => {
          return [
            {
              type: 'field',
              params: [val],
            },
            { // 对应 mean(val.seleteItem)
              type: opt.groupFunc || opt.selectFunction || 'mean',
              params: [],
            },
            { // 确保后端返回columns有 val.label 的别名
              type: 'alias',
              params: [val],
            },
          ]
        })
      }
      const model = {
        measurement: val.fromItem,
        select,
        group_by: [
          // { type: 'tag', params: ['host_id'] },
        ],
        tags: [
          {
            key: 'host_id',
            value: this.hostId,
            operator: '=',
          },
          ...val.extraTags,
        ],
      }
      if (val.groupBy && val.groupBy.length > 0) {
        val.groupBy.forEach(group => {
          model.group_by.push({
            type: 'tag',
            params: [group],
          })
        })
      }
      const data = {
        metric_query: [
          {
            model,
          },
        ],
        scope: this.$store.getters.scope,
        unit: true,
        skip_check_series: true,
      }
      return data
    },
  },
}
</script>

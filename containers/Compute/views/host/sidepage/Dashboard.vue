<template>
  <div>
    <a-divider orientation="left">{{$t('compute.text_572')}}</a-divider>
      <a-row
        type="flex"
        class="mb-2 host-dash-card-row"
        :gutter="{ lg: 24, xl: 12, xxl: 24 }"
        :style="{ '--host-card-cols': capacityList.length || 1 }">
        <a-col class="mb-3 host-dash-card-col" v-for="item in capacityList" :key="item.label || item.title">
          <ring-card v-if="item.pieData" :options="item" height="230px" />
          <progress-card v-else :progress="item" :card-style="{height: '312px'}" />
        </a-col>
      </a-row>
    <a-divider class="mt-3" orientation="left">{{$t('compute.monitor_statistics')}}</a-divider>
      <a-row
        type="flex"
        class="mb-2 host-dash-card-row"
        :gutter="{ lg: 24, xl: 12, xxl: 24 }"
        :style="{ '--host-card-cols': capacityList.length || monitorList.length || 1 }">
        <a-col class="mb-3 host-dash-card-col" v-for="item in monitorList" :key="item.title">
          <progress-card :progress="item" :card-style="{height: '312px'}" />
        </a-col>
      </a-row>
    <!-- <a-divider class="mt-3" orientation="left">{{$t('compute.text_573')}}</a-divider>
    <a-spin :spinning="loading">
      <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
        <a-col class="mb-3" :lg="12" :xl="6" v-for="item in gaugeList" :key="item.label">
          <progress-card
            :progress="item"
            :progress-props="item.progressProps"
            :unit="item.unit"
            :numerifyFloat="item.numerifyFloat"
            :percentFormat="item.percentFormat" />
        </a-col>
      </a-row>
    </a-spin> -->
    <a-divider class="mt-3" orientation="left">{{ top5Title }}</a-divider>
    <a-spin :spinning="top5Loading">
      <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
        <a-col class="mb-3" :lg="12" :xl="8" v-for="item in topList" :key="item.name">
          <top5 :topMsg="item" />
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script>
import _ from 'lodash'
import numerify from 'numerify'
import { CONTAINER_MONITOR } from '@Compute/views/pod-container/constants'
import ProgressCard from '@/sections/ProgressCard'
import RingCard from '@/sections/RingCard'
import Top5 from '@/sections/Top5'
import { getSignature } from '@/utils/crypto'
import { sizestrWithUnit, getRequestT } from '@/utils/utils'
import { GAUGEMSG, HOST_TOP5, HOST_INFO_OPTS } from '../constants'
import { getHostSpecInfo } from '../utils/index'

export default {
  name: 'HostDashboard',
  components: {
    ProgressCard,
    Top5,
    RingCard,
  },
  props: {
    resId: {
      type: String,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      gaugeList: [],
      loading: false,
      top5Loading: false,
      topList: [],
      progressListPercent: [0, 0, 0],
      usageData: {},
    }
  },
  computed: {
    topType () {
      if (this.data.host_type === 'hypervisor') return 'isKvm'
      return 'noKvm'
    },
    isContainerHost () {
      return this.data.host_type === 'container'
    },
    top5Title () {
      return this.isContainerHost
        ? this.$t('compute.host_top5_container')
        : this.$t('compute.host_top5_vm')
    },
    top5Constants () {
      return this.isContainerHost ? CONTAINER_MONITOR : HOST_TOP5[this.topType]
    },
    top5GroupByTag () {
      return this.isContainerHost ? 'container_name' : 'vm_name'
    },
    progressList () {
      const data = this.data
      const obj = getHostSpecInfo(data)
      const usage = this.usageData || {}
      const f = v => v || 0
      const cpuAllocated = f(usage['all.servers.cpu']) + f(usage['all.containers.cpu'])
      const cpuRunning = f(usage['all.running_servers.cpu']) + f(usage['all.running_containers.cpu'])
      const cpuVirtual = f(usage['hosts.cpu.virtual'])
      const memAllocated = f(usage['all.servers.memory']) + f(usage['all.containers.memory'])
      const memRunning = f(usage['all.running_servers.memory']) + f(usage['all.running_containers.memory'])
      const memVirtual = f(usage['hosts.memory.virtual'])
      const diskUsed = f(usage['all.disks'])
      const diskVirtual = f(usage['storages.virtual'])
      const running = f(usage['all.running_servers'])
      const ready = f(usage['all.ready_servers'])
      const pend = f(usage['all.pending_delete_servers'])
      const serversTotal = f(usage['all.servers'])
      const other = Math.max(serversTotal - running - ready - pend, 0)
      const gpuTotal = f(usage['isolated_devices.gpu'])
      const gpuUsed = f(usage['isolated_devices.gpu.used'])
      return [
        {
          pieData: [
            {
              name: `${this.$t('common.text00051')}: ${running}`,
              value: running,
            },
            {
              name: `${this.$t('status.server.ready')}: ${ready}`,
              value: ready,
            },
            {
              name: `${this.$t('common.text00052')}: ${pend}`,
              value: pend,
            },
            {
              name: `${this.$t('common.text00053')}: ${other}`,
              value: other,
            },
          ],
          title: this.$t('common.text00054'),
          total: serversTotal,
        },
        {
          title: this.$t('compute.text_563_1'),
          percent: cpuAllocated / (cpuVirtual || 1),
          msg: {
            current: cpuAllocated,
            running: cpuRunning,
            runningLabel: this.$t('compute.running_used'),
            totalLabel: this.$t('compute.virtual_total'),
            total: cpuVirtual,
          },
        },
        {
          title: this.$t('compute.text_564_1'),
          percent: memAllocated / (memVirtual || 1),
          msg: {
            current: sizestrWithUnit(memAllocated, 'M', 1024),
            running: sizestrWithUnit(memRunning, 'M', 1024),
            runningLabel: this.$t('compute.running_used'),
            totalLabel: this.$t('compute.virtual_total'),
            total: `${sizestrWithUnit(memVirtual, 'M', 1024)}`,
          },
        },
        {
          title: this.$t('compute.text_565_1'),
          percent: diskUsed / (diskVirtual || 1),
          msg: {
            current: sizestrWithUnit(diskUsed, 'M', 1024),
            totalLabel: this.$t('compute.virtual_total'),
            total: `${sizestrWithUnit(diskVirtual, 'M', 1024)}`,
          },
        },
        {
          pieData: [
            {
              name: `${this.$t('common.text00055')}: ${gpuUsed}`,
              value: gpuUsed,
            },
            {
              name: `${this.$t('common.text00056')}: ${Math.max(gpuTotal - gpuUsed, 0)}`,
              value: Math.max(gpuTotal - gpuUsed, 0),
            },
          ],
          title: this.$t('common.text00057'),
          totalLabel: this.$t('common_234'),
          total: gpuTotal,
        },
        {
          title: this.$t('compute.text_563'),
          percent: this.progressListPercent[0],
        },
        {
          title: this.$t('compute.text_564'),
          percent: this.progressListPercent[1],
          msg: {
            current: sizestrWithUnit(obj.mem_size * this.progressListPercent[1], 'M', 1024),
            totalLabel: this.$t('compute.actual_total'),
            currentLabel: this.$t('compute.actual_used'),
            total: `${sizestrWithUnit(obj.mem_size, 'M', 1024)} (${this.$t('compute.text_564')}: ${sizestrWithUnit(obj.mem_size - obj.mem_reserved, 'M', 1024)}, ${this.$t('compute.reserved')}: ${sizestrWithUnit(obj.mem_reserved, 'M', '1024')})`,
          },
        },
        {
          title: this.$t('compute.text_565'),
          percent: this.progressListPercent[2],
          msg: {
            current: sizestrWithUnit(obj.storage_size * this.progressListPercent[2], 'M', 1024),
            totalLabel: this.$t('compute.actual_total'),
            currentLabel: this.$t('compute.actual_used'),
            total: `${sizestrWithUnit(obj.storage_size, 'M', 1024)} (${this.$t('compute.text_565')}: ${sizestrWithUnit(obj.storage_size, 'M', '1024')})`,
          },
        },
      ]
    },
    capacityList () {
      return this.progressList.slice(0, 5)
    },
    monitorList () {
      return this.progressList.slice(5)
    },
  },
  created () {
    // this.fetchGaugeData()
    this.fetchUsageData()
    this.fetchUsedPercent()
    this.fetchTop5Data()
  },
  methods: {
    async fetchUsageData () {
      try {
        const { data } = await new this.$Manager('usages').getSpecific({
          id: 'hosts',
          spec: this.resId,
          params: { scope: this.$store.getters.scope },
        })
        this.usageData = data || {}
      } catch (err) {
        console.error(err)
      }
    },
    async fetchUsedPercent () {
      try {
        const reqList = HOST_INFO_OPTS.map(opt => {
          return new this.$Manager('unifiedmonitors', 'v1')
            .performAction({
              id: 'query',
              action: '',
              data: this.genQueryData(opt, 'host_id'),
              params: { $t: getRequestT() },
            })
        })
        const res = await Promise.all(reqList)
        const list = []
        res.forEach((r, index) => {
          const { series = [{}] } = (r.data || {})
          const { points = [] } = (series[0] || {})
          if (points.length) {
            console.log(points)
            const percent = points.reduce((acc, cur) => acc + cur[0], 0) / points.length
            list.push(percent / 100)
          } else {
            list.push(0)
          }
        })
        this.progressListPercent = list
      } catch (err) {
        console.error(err)
      }
    },
    _getSeriesMax (arr, nameTag = 'vm_name') {
      if (!arr) return []
      const data = arr.map(item => {
        const name = (item.tags && item.tags[nameTag]) || ''
        return {
          name,
          link: '/a/v',
          value: Math.max.apply(null, item.points.map(i => i[0])),
        }
      })
      return data
    },
    async fetchTop5Data () {
      const top5ResourceData = this.top5Constants
      this.top5Loading = true
      this.topList = []
      for (let i = 0; i < top5ResourceData.length; i++) {
        const val = top5ResourceData[i]
        try {
          const { data } = await new this.$Manager('unifiedmonitors', 'v1')
            .performAction({
              id: 'query',
              action: '',
              data: this.genQueryData(val, this.top5GroupByTag),
              params: { $t: getRequestT() },
            })
          const series = this._getSeriesMax(data.series, this.top5GroupByTag)
          this.topList.push({
            // metric: TOP5REQDATA[i].metrics[0].name[0], // 需要 link 跳转页面的时候可以加上
            title: val.label,
            data: series,
            unit: val.unit,
          })
        } catch (error) {
          this.top5Loading = false
          throw error
        }
      }
      this.top5Loading = false
    },
    async fetchGaugeData () {
      this.loading = true
      for (let i = 0; i < GAUGEMSG.length; i++) {
        try {
          const value = GAUGEMSG[i]
          const { data } = await new this.$Manager('unifiedmonitors', 'v1')
            .performAction({
              id: 'query',
              action: '',
              data: this.genGaugeQueryData(value),
              params: { $t: getRequestT() },
            })
          const series = data.series
          const values = _.get(series, '[0].points')
          if (values && values.length) {
            const temValues = values.map(v => (v[0] || 0))
            const maxNum = temValues.length ? Math.max.apply(null, temValues) : 0
            let unit = '%'
            let numerifyFloat = '0.00'
            let percent = maxNum / 100
            if (value.label === this.$t('compute.text_517')) {
              unit = ''
              numerifyFloat = '0.0000'
              percent = maxNum
              var percentFormat = this.percentFormat
            }
            this.gaugeList.push({
              title: value.label,
              percent,
              unit,
              numerifyFloat,
              percentFormat,
              progressProps: {
                type: 'dashboard',
              },
            })
          }
        } catch (error) {
          this.loading = false
          throw error
        }
      }
      this.loading = false
    },
    percentFormat (vm) {
      const per = (vm.percent || 0) / 100
      const oversell = per > 100 ? <a-tag color="red">{this.$t('common_714')}</a-tag> : null
      return (<div>{oversell}<div class="mt-2 text-color">{ numerify(per * 100, vm.numerifyFloat) }{ vm.unit }</div></div>)
    },
    genGaugeQueryData (val) {
      const select = [
        {
          type: 'field',
          params: [val.sql.key],
        },
        { // 对应 mean(val.seleteItem)
          type: 'max',
          params: [],
        },
      ]
      let tags = []
      if (val.sql.db === 'net') {
        tags = [
          {
            key: 'interface',
            value: 'eth0',
            operator: '=',
          },
          {
            key: 'host_id',
            value: this.resId,
            operator: '=',
          },
        ]
      } else { // 其他类型宿主机(esxi、openstack、zstack)
        tags.push({
          key: 'host_id',
          value: this.resId,
          operator: '=',
        })
      }
      const data = {
        metric_query: [
          {
            model: {
              measurement: val.sql.db,
              select: [select],
              tags,
            },
          },
        ],
        scope: this.$store.getters.scope,
        from: '1m',
        interval: '1m',
        unit: true,
      }
      data.signature = getSignature(data)
      return data
    },
    // groupByTag: 使用率查宿主机用 host_id；TOP5 查虚拟机用 vm_name
    genQueryData (val, groupByTag = 'vm_name') {
      const select = [
        {
          type: 'field',
          params: [val.seleteItem],
        },
        { // 对应 mean(val.seleteItem)
          type: 'max',
          params: [],
        },
      ]
      let tags = []
      if (this.topType === 'isKvm') { // kvm 型宿主机
        tags = [
          {
            key: 'host_id',
            value: this.data.id,
            operator: '=',
          },
        ]
      } else { // 其他类型宿主机(esxi、openstack、zstack)
        tags.push({
          key: 'host_id',
          value: this.data.id,
          operator: '=',
        })
      }
      const data = {
        metric_query: [
          {
            model: {
              measurement: val.fromItem,
              select: [select],
              group_by: [{ type: 'tag', params: [groupByTag] }],
              tags,
            },
          },
        ],
        scope: this.$store.getters.scope,
        from: '30m',
        interval: '1m',
        unit: true,
      }
      data.signature = getSignature(data)
      return data
    },
  },
}
</script>

<style lang="less" scoped>
.host-dash-card-col {
  flex: 0 0 50%;
  max-width: 50%;
}
@media (min-width: 1200px) {
  .host-dash-card-col {
    flex: 0 0 calc(100% / var(--host-card-cols, 4));
    max-width: calc(100% / var(--host-card-cols, 4));
  }
}
</style>

<template>
  <div>
    <a-divider orientation="left">{{$t('compute.text_572')}}</a-divider>
      <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
        <a-col class="mb-3" :lg="12" :xl="6" v-for="(item, index) in progressList" :key="item.label">
          <progress-card :progress="item" v-if="index !== 3" :card-style="{height: '312px'}" />
          <ring-card v-else :options="item" height="230px" />
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
    <a-divider class="mt-3" orientation="left">TOP5</a-divider>
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
import ProgressCard from '@/sections/ProgressCard'
import RingCard from '@/sections/RingCard'
import { sizestrWithUnit, getRequestT } from '@/utils/utils'
import Top5 from '@/sections/Top5'
import { getSignature } from '@/utils/crypto'
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
    }
  },
  computed: {
    topType () {
      if (this.data.host_type === 'hypervisor') return 'isKvm'
      return 'noKvm'
    },
    progressList () {
      const data = this.data
      const obj = getHostSpecInfo(data)
      const tempList = new Array(3)
      tempList[0] = (() => {
        return {
          title: this.$t('compute.text_563_1'),
          percent: obj.cpu_commit / obj.cpu_count_virtual,
          msg: {
            current: obj.cpu_commit,
            totalLabel: this.$t('compute.virtual_total'),
            total: obj.cpu_count_virtual,
          },
        }
      })()
      tempList[1] = (() => {
        return {
          title: this.$t('compute.text_564_1'),
          percent: obj.mem_commit / obj.mem_size_virtual,
          msg: {
            current: sizestrWithUnit(obj.mem_commit, 'M', 1024),
            totalLabel: this.$t('compute.virtual_total'),
            total: `${sizestrWithUnit(obj.mem_size_virtual, 'M', 1024)}`,
          },
        }
      })()
      tempList[2] = (() => {
        return {
          title: this.$t('compute.text_565_1'),
          percent: obj.storage_commit / obj.storage_size_virtual,
          msg: {
            current: sizestrWithUnit(obj.storage_commit, 'M', 1024),
            totalLabel: this.$t('compute.virtual_total'),
            total: `${sizestrWithUnit(obj.storage_size_virtual, 'M', 1024)}`,
          },
        }
      })()
      tempList[3] = (() => {
        const current = obj.running_guests || 0
        const ready = obj.ready_guests || 0
        const pend = obj.pending_deleted_guests || 0
        const other = obj.other_guests || 0
        const total = current + ready + pend + other
        return {
          pieData: [
            {
              name: `${this.$t('common.text00051')}: ${current}`,
              value: current,
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
          total: total,
        }
      })()
      tempList[4] = (() => {
        return {
          title: this.$t('compute.text_563'),
          percent: this.progressListPercent[0],
          msg: {
            current: parseInt(obj.cpu_count * this.progressListPercent[0]) < obj.cpu_count * this.progressListPercent[0] ? Math.floor(parseInt(obj.cpu_count * this.progressListPercent[0]) + 1, obj.cpu_count) : obj.cpu_count * this.progressListPercent[0], // 向上取整
            totalLabel: this.$t('compute.actual_total'),
            currentLabel: this.$t('compute.actual_used'),
            total: `${obj.cpu_count} (${this.$t('compute.text_563')}: ${obj.cpu_count - obj.cpu_reserved}, ${this.$t('compute.reserved')}: ${obj.cpu_reserved})`,
          },
        }
      })()
      tempList[5] = (() => {
        return {
          title: this.$t('compute.text_564'),
          percent: this.progressListPercent[1],
          msg: {
            current: sizestrWithUnit(obj.mem_size * this.progressListPercent[1], 'M', 1024),
            totalLabel: this.$t('compute.actual_total'),
            currentLabel: this.$t('compute.actual_used'),
            total: `${sizestrWithUnit(obj.mem_size, 'M', 1024)} (${this.$t('compute.text_564')}: ${sizestrWithUnit(obj.mem_size - obj.mem_reserved, 'M', 1024)}, ${this.$t('compute.reserved')}: ${sizestrWithUnit(obj.mem_reserved, 'M', '1024')})`,
          },
        }
      })()
      tempList[6] = (() => {
        return {
          title: this.$t('compute.text_565'),
          percent: this.progressListPercent[2],
          msg: {
            current: sizestrWithUnit(obj.storage_size * this.progressListPercent[2], 'M', 1024),
            totalLabel: this.$t('compute.actual_total'),
            currentLabel: this.$t('compute.actual_used'),
            total: `${sizestrWithUnit(obj.storage_size, 'M', 1024)} (${this.$t('compute.text_565')}: ${sizestrWithUnit(obj.storage_size, 'M', '1024')})`,
          },
        }
      })()
      return tempList
    },
  },
  created () {
    // this.fetchGaugeData()
    this.fetchUsedPercent()
    this.fetchTop5Data()
  },
  methods: {
    async fetchUsedPercent () {
      try {
        const reqList = HOST_INFO_OPTS.map(opt => {
          return new this.$Manager('unifiedmonitors', 'v1')
            .performAction({
              id: 'query',
              action: '',
              data: this.genQueryData(opt),
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
    _getSeriesMax (arr) {
      if (!arr) return []
      const data = arr.map(item => {
        this.vmName = item.tags.vm_name
        return {
          name: this.vmName,
          link: '/a/v',
          value: Math.max.apply(null, item.points.map(i => i[0])),
        }
      })
      return data
    },
    async fetchTop5Data () {
      const top5ResourceData = HOST_TOP5[this.topType]
      this.top5Loading = true
      this.topList = []
      for (let i = 0; i < top5ResourceData.length; i++) {
        const val = top5ResourceData[i]
        try {
          const { data } = await new this.$Manager('unifiedmonitors', 'v1')
            .performAction({
              id: 'query',
              action: '',
              data: this.genQueryData(val),
              params: { $t: getRequestT() },
            })
          const series = this._getSeriesMax(data.series)
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
    genQueryData (val) {
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
              group_by: [{ type: 'tag', params: ['vm_name'] }],
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

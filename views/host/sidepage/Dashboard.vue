<template>
  <div>
    <a-divider orientation="left">{{$t('compute.text_572')}}</a-divider>
      <a-row class="mb-2" :gutter="{ lg: 24, xl: 12, xxl: 24 }">
        <a-col class="mb-3" :lg="12" :xl="6" v-for="item in progressList" :key="item.label">
          <progress-card :progress="item" />
        </a-col>
      </a-row>
    <a-divider class="mt-3" orientation="left">{{$t('compute.text_573')}}</a-divider>
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
    </a-spin>
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
import { GAUGEMSG, HOST_TOP5 } from '../constants'
import ProgressCard from '@/sections/ProgressCard'
import { sizestrWithUnit, getRequestT } from '@/utils/utils'
import Top5 from '@/sections/Top5'
import { getSignature } from '@/utils/crypto'

export default {
  name: 'HostDashboard',
  components: {
    ProgressCard,
    Top5,
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
      progressList: [],
      gaugeList: [],
      loading: false,
      top5Loading: false,
      topList: [],
    }
  },
  computed: {
    topType () {
      if (this.data.host_type === 'hypervisor') return 'isKvm'
      return 'noKvm'
    },
  },
  created () {
    this.turnToList(this.data)
    this.fetchGaugeData()
    this.fetchTop5Data()
  },
  methods: {
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
      const oversell = per > 100 ? <a-tag color="red">超售</a-tag> : null
      return (<div>{oversell}<div class="mt-2 text-color">{ numerify(per, vm.numerifyFloat) }{ vm.unit }</div></div>)
    },
    turnToList (obj) {
      const tempList = new Array(4)
      tempList[0] = (() => {
        const current = obj.cpu_commit || 0
        const total = obj.cpu_count - (obj.cpu_reserved || 0)
        return {
          title: 'CPU',
          percent: total ? (current / total) : 0,
          msg: {
            current,
            total,
            currentLabel: this.$t('compute.text_574'),
          },
        }
      })()
      tempList[1] = (() => {
        const current = obj.mem_commit || 0
        const total = (obj.mem_size - (obj.mem_reserved || 0)) || 0
        return {
          title: this.$t('compute.text_369'),
          percent: total ? (current / total) : 0,
          msg: {
            current: sizestrWithUnit(current, 'M', 1024),
            currentLabel: this.$t('compute.text_574'),
            total: sizestrWithUnit(total, 'M', 1024),
          },
        }
      })()
      tempList[2] = (() => {
        const current = obj.storage_used || 0
        const total = obj.storage_size || 0
        return {
          title: this.$t('compute.text_575'),
          percent: total ? (current / total) : 0,
          msg: {
            current: sizestrWithUnit(current, 'M', 1024),
            total: sizestrWithUnit(total, 'M', 1024),
          },
        }
      })()
      tempList[3] = (() => {
        const current = obj.running_guests || 0
        const total = obj.guests || 0
        return {
          title: this.$t('dictionary.server'),
          percent: total ? (current / total) : 0,
          msg: {
            current,
            currentLabel: this.$t('compute.text_574'),
            total,
            totalLabel: this.$t('compute.text_576'),
          },
        }
      })()
      this.progressList = tempList
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
        from: '10m',
        interval: '1m',
        unit: true,
      }
      data.signature = getSignature(data)
      return data
    },
  },
}
</script>

<template>
  <div>
    <div v-if="hadMonitor">
      <monitor
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        :customTime.sync="customTime"
        :groupFunc.sync="groupFunc"
        :monitorList="monitorList"
        :loading="loading"
        @refresh="fetchData" />
    </div>
    <a-alert
      v-else
      :message="$t('db.text_183')"
      :description="$t('db.text_184')"
      type="warning" />
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { REDIS_MONITOR_ALL_OPTS } from '@DB/constants'
import { UNITS, autoComputeUnit, getRequestT } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import { getSignature } from '@/utils/crypto'
import MonitorTimeMixin from '@/mixins/monitorTime'

export default {
  name: 'RedisMonitorSidepage',
  components: {
    Monitor,
  },
  mixins: [WindowsMixin, MonitorTimeMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      time: '168h',
      timeGroup: '30m',
      customTime: null,
      groupFunc: 'mean',
      monitorList: [],
    }
  },
  computed: {
    hadMonitor () {
      const brand = this.data.brand.toLowerCase()
      const surportBrand = [HYPERVISORS_MAP.aliyun.key, HYPERVISORS_MAP.huawei.key, HYPERVISORS_MAP.qcloud.key, HYPERVISORS_MAP.azure.key, HYPERVISORS_MAP.apsara.key, HYPERVISORS_MAP.aws.key]
      return surportBrand.includes(brand)
    },
    monitorConstants () {
      if (this.data.brand) {
        const brand = this.data.brand.toLowerCase()
        return REDIS_MONITOR_ALL_OPTS.filter(item => {
          return item.supportBrands.includes(brand)
        })
      }
      return []
    },
    dbId () {
      return this.data.id
    },
  },
  created () {
    this.fetchData()
    this.fetchDataDebounce = _.debounce(this.fetchData, 500)
    this.baywatch(['time', 'timeGroup', 'data.id', 'customTime', 'groupFunc'], this.fetchDataDebounce)
  },
  methods: {
    async fetchData () {
      this.loading = true
      const resList = []
      for (let idx = 0; idx < this.monitorConstants.length; idx++) {
        const val = { ...this.monitorConstants[idx], groupFunc: this.groupFunc }
        try {
          const { data } = await new this.$Manager('unifiedmonitors', 'v1')
            .performAction({
              id: 'query',
              action: '',
              data: this.genQueryData(val),
              params: { $t: getRequestT() },
            })
          resList.push({ title: val.label, constants: val, series: data.series })
          if (idx === this.monitorConstants.length - 1) {
            this.loading = false
            this.getMonitorList(resList)
          }
        } catch (error) {
          this.loading = false
          throw error
        }
      }
      this.saveMonitorConfig()
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    getMonitorList (resList) {
      const lineConfig = { // 宿主机指标比较多，样式fix
        tooltip: {
          confine: true,
        },
        grid: {
          top: '20%',
        },
      }
      this.monitorList = resList.map(result => {
        const { unit, transfer, seleteItem } = result.constants
        const isSizestrUnit = UNITS.includes(unit)
        let series = result.series
        if (!series) series = []
        if (isSizestrUnit || unit === 'bps') {
          series = series.map(serie => {
            return autoComputeUnit(serie, unit, transfer, seleteItem)
          })
        }
        return {
          title: result.title,
          series,
          constants: result.constants,
          lineConfig,
        }
      })
    },
    genQueryData (val) {
      const opt = val
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
              type: opt.groupFunc || 'mean',
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
              type: opt.groupFunc || 'mean',
              params: [],
            },
            { // 确保后端返回columns有 val.label 的别名
              type: 'alias',
              params: [val],
            },
          ]
        })
      }
      const tags = [
        {
          key: 'redis_id',
          value: this.dbId,
          operator: '=',
        },
      ]
      if (R.is(Object, val.tags)) {
        R.forEachObjIndexed((value, key) => {
          tags.push({
            condition: 'AND',
            key,
            value,
            operator: '=',
          })
        }, val.tags)
      }
      const data = {
        metric_query: [
          {
            model: {
              measurement: val.fromItem,
              select,
              tags,
            },
          },
        ],
        scope: this.$store.getters.scope,
        from: this.time,
        interval: this.timeGroup,
        unit: true,
      }
      if (this.time === 'custom' && this.customTime && this.customTime.from && this.customTime.to) {
        data.from = this.customTime.from
        data.to = this.customTime.to
      }
      data.signature = getSignature(data)
      return data
    },
  },
}
</script>

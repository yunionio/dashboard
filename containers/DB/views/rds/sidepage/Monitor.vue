<template>
  <div>
    <div v-if="hadMonitor">
      <monitor
        :time.sync="time"
        :timeGroup.sync="timeGroup"
        :monitorList="monitorList"
        :loading="loading"
        @refresh="fetchData" />
    </div>
    <template v-else>
      <a-alert
        :message="$t('db.text_183')"
        class="mb-2"
        :description="$t('db.text_184')"
        type="warning" />
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { RDS_MONITOR_OPTS } from '@DB/constants'
import { UNITS, autoComputeUnit, getRequestT } from '@/utils/utils'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import { getSignature } from '@/utils/crypto'

export default {
  name: 'RDSnitorSidepage',
  components: {
    Monitor,
  },
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      loading: false,
      time: '1h',
      timeGroup: '5m',
      monitorList: [],
    }
  },
  computed: {
    brand () {
      if (this.data.brand) {
        return this.data.brand.toLowerCase()
      }
      return ''
    },
    hadMonitor () {
      const brand = this.data.brand.toLowerCase()
      const surportBrand = [HYPERVISORS_MAP.aliyun.key, HYPERVISORS_MAP.huawei.key, HYPERVISORS_MAP.qcloud.key]
      return surportBrand.includes(brand)
    },
    monitorConstants () {
      const brand = this.brand
      return RDS_MONITOR_OPTS[brand] || []
    },
    dbId () {
      return this.data.id
    },
  },
  created () {
    this.fetchData()
    this.fetchDataDebounce = _.debounce(this.fetchData, 500)
    this.baywatch(['time', 'timeGroup', 'data.id'], this.fetchDataDebounce)
  },
  methods: {
    async fetchData () {
      this.loading = true
      const resList = []
      for (let idx = 0; idx < this.monitorConstants.length; idx++) {
        const val = this.monitorConstants[idx]
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
        const { unit, transfer } = result.constants
        const isSizestrUnit = UNITS.includes(unit)
        let series = result.series
        if (!series) series = []
        if (isSizestrUnit || unit === 'bps') {
          series = series.map(serie => {
            return autoComputeUnit(serie, unit, transfer)
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
              type: 'mean',
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
              type: 'mean',
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
          key: 'rds_id',
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
      data.signature = getSignature(data)
      return data
    },
  },
}
</script>

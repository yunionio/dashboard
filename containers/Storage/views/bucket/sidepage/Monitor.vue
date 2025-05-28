<template>
  <div>
    <div v-if="hadMonitor">
      <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
    </div>
    <a-alert
      v-else
      :message="$t('storage.text_148')"
      :description="$t('storage.text_149')"
      type="warning" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { OSS_MONITOR_OPTS } from '@Storage/constants'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'BucketMonitorSidepage',
  components: {
    DashboardCards,
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
    }
  },
  computed: {
    hadMonitor () {
      const brand = this.data.brand.toLowerCase()
      const surportBrand = [HYPERVISORS_MAP.aliyun.key, HYPERVISORS_MAP.huawei.key, HYPERVISORS_MAP.apsara.key]
      return surportBrand.includes(brand)
    },
    monitorConstants () {
      if (this.data.brand) {
        const brand = this.data.brand.toLowerCase()
        return OSS_MONITOR_OPTS[brand] || []
      }
      return []
    },
    dbId () {
      return this.data.id
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
  },
  created () {
  },
  methods: {
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
          key: 'oss_id',
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
        unit: true,
      }
      return data
    },
  },
}
</script>

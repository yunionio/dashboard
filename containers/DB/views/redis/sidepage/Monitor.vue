<template>
  <div>
    <div v-if="hadMonitor">
      <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
    </div>
    <a-alert
      v-else
      :message="$t('db.text_183')"
      :description="$t('db.text_184')"
      type="warning" />
  </div>
</template>

<script>
import * as R from 'ramda'
import { REDIS_MONITOR_ALL_OPTS } from '@DB/constants'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { buildPanelName } from '@Monitor/utils'
import { MONITOR_TEMPLATE_REDIS, resolveMonitorTemplatePanels } from '@Monitor/utils/monitorTemplate'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'RedisMonitorSidepage',
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
      if (this.templateMonitorConstants.length) return true
      const brand = this.data.brand.toLowerCase()
      const surportBrand = [HYPERVISORS_MAP.aliyun.key, HYPERVISORS_MAP.huawei.key, HYPERVISORS_MAP.qcloud.key, HYPERVISORS_MAP.azure.key, HYPERVISORS_MAP.apsara.key, HYPERVISORS_MAP.aws.key]
      return surportBrand.includes(brand)
    },
    // 策略定义中配置的 Redis 监控模板，对全部 Redis 实例生效
    templateMonitorConstants () {
      return resolveMonitorTemplatePanels(this.$store.getters.scopedPolicy, {
        category: MONITOR_TEMPLATE_REDIS,
      })
    },
    monitorConstants () {
      if (this.templateMonitorConstants.length) {
        return this.templateMonitorConstants
      }
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
    localPanels () {
      return this.monitorConstants.map(item => {
        return {
          panel_name: buildPanelName(item.label, item.metric, item.fromItem, item.seleteItem),
          constants: item,
          queryData: this.genQueryData(item),
        }
      })
    },
  },
  created () {
    this.fetchMonitorTemplates()
  },
  methods: {
    fetchMonitorTemplates () {
      // 监控模板在策略定义中配置，绑定的范围内全部 Redis 实例生效
      return this.$store.dispatch('scopedPolicy/get', {
        category: [MONITOR_TEMPLATE_REDIS],
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
              type: opt.groupFunc || opt.selectType || opt.selectFunction || 'mean',
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
              type: opt.groupFunc || opt.selectType || opt.selectFunction || 'mean',
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
        unit: true,
      }
      return data
    },
  },
}
</script>

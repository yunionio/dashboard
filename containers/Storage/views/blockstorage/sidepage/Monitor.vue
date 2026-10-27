<template>
  <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
</template>

<script>
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { buildPanelName } from '@Monitor/utils'
import { MONITOR_TEMPLATE_BLOCKSTORAGE, resolveMonitorTemplatePanels } from '@Monitor/utils/monitorTemplate'
import WindowsMixin from '@/mixins/windows'
import { STORAGE_MONITOR_OPTS } from '../constants'
export default {
  name: 'StorageMonitorSidepage',
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
      singleActions: [
      ],
    }
  },
  computed: {
    // 策略定义中配置的块存储监控模板，对全部块存储生效
    templateMonitorConstants () {
      return resolveMonitorTemplatePanels(this.$store.getters.scopedPolicy, {
        category: MONITOR_TEMPLATE_BLOCKSTORAGE,
      })
    },
    monitorConstants () {
      return this.templateMonitorConstants.length ? this.templateMonitorConstants : STORAGE_MONITOR_OPTS
    },
    wireId () {
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
      // 监控模板在策略定义中配置，绑定的范围内全部块存储生效
      return this.$store.dispatch('scopedPolicy/get', {
        category: [MONITOR_TEMPLATE_BLOCKSTORAGE],
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
      const data = {
        metric_query: [
          {
            model: {
              measurement: val.fromItem,
              select,
              group_by: [
                { type: 'tag', params: ['id'] },
              ],
              tags: [
                {
                  key: 'id',
                  value: this.wireId,
                  operator: '=',
                },
              ],
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

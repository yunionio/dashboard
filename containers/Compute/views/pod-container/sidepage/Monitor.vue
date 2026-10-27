<template>
  <div>
    <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
  </div>
</template>

<script>
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { buildPanelName } from '@Monitor/utils'
import { MONITOR_TEMPLATE_CONTAINER, resolveMonitorTemplatePanels } from '@Monitor/utils/monitorTemplate'
import WindowsMixin from '@/mixins/windows'
import { CONTAINER_MONITOR } from '../constants'

export default {
  name: 'MonitorListForVmPodContainerSidepage',
  components: {
    DashboardCards,
  },
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      currentMonitorType: 'basic',
      extraTags: [{
        key: 'container_name',
        operator: '=',
        value: this.data.name,
      }],
    }
  },
  computed: {
    // 策略定义中配置的容器监控模板，对容器主机内的全部容器生效
    monitorConstants () {
      const panels = resolveMonitorTemplatePanels(this.$store.getters.scopedPolicy, {
        category: MONITOR_TEMPLATE_CONTAINER,
      })
      return panels.length ? panels : CONTAINER_MONITOR
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
      // 监控模板在策略定义中配置，绑定的范围内全部容器生效
      return this.$store.dispatch('scopedPolicy/get', {
        category: [MONITOR_TEMPLATE_CONTAINER],
      })
    },
    genQueryData (val) {
      const opt = val
      val.extraTags = this.extraTags
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
            key: 'pod_id',
            value: this.data.guest_id,
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

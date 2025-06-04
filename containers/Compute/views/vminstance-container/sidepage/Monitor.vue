<template>
  <div>
    <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
  </div>
</template>

<script>
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import WindowsMixin from '@/mixins/windows'
import { POD_MONITOR } from '../constants'

export default {
  name: 'VmContainerMonitorSidepage',
  components: {
    DashboardCards,
  },
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: false,
    },
    monitorResId: {
      type: String,
      required: false,
    },
  },
  data () {
    return {
      currentMonitorType: 'basic',
      monitorConstants: POD_MONITOR,
    }
  },
  computed: {
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
    this.$bus.$on('VmMonitorTypeChange', (tab) => {
      this.$refs.dashboardCards.initMonitorConfig()
    })
  },
  methods: {
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
            key: 'vm_id',
            value: this.monitorResId,
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

<template>
  <div>
    <div v-if="hadMonitor">
      <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
    </div>
    <template v-else>
      <a-alert
        :message="$t('db.text_183')"
        class="mb-2"
        type="warning" />
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { LB_MONITOR_OPTS } from '@Network/constants/lb'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'LbMnitorSidepage',
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
    brand () {
      if (this.data.brand) {
        return this.data.brand.toLowerCase()
      }
      return ''
    },
    hadMonitor () {
      const brand = this.data.brand.toLowerCase()
      const surportBrand = [HYPERVISORS_MAP.azure.key, HYPERVISORS_MAP.apsara.key, HYPERVISORS_MAP.hcso.key]
      return surportBrand.includes(brand)
    },
    monitorConstants () {
      const brand = this.brand
      return LB_MONITOR_OPTS[brand] || []
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
              type: opt.groupFunc || val.selectType || 'mean',
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
          key: 'elb_id',
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

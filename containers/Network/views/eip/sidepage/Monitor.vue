<template>
  <div>
    <div v-if="hadMonitor">
      <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
    </div>
    <template v-else>
      <a-alert
        :message="$t('network.monitor.not_support')"
        class="mb-2"
        type="warning" />
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'
import { buildPanelName } from '@Monitor/utils'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import { EIP_MONITOR_OPTS } from '../constants'

export default {
  name: 'EipMonitorSidepage',
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
  computed: {
    brand () {
      if (this.data.brand) {
        return this.data.brand.toLowerCase()
      }
      return ''
    },
    hadMonitor () {
      const brand = this.brand
      const supportBrand = [
        HYPERVISORS_MAP.aliyun.key,
        HYPERVISORS_MAP.apsara.key,
        HYPERVISORS_MAP.huawei.key,
        HYPERVISORS_MAP.hcso.key,
        HYPERVISORS_MAP.hcs.key,
        HYPERVISORS_MAP.qcloud.key,
      ]
      return supportBrand.includes(brand)
    },
    monitorConstants () {
      const brand = this.brand
      return EIP_MONITOR_OPTS.filter(item => {
        return !item.supportBrands || item.supportBrands.includes(brand)
      })
    },
    resId () {
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
  methods: {
    genQueryData (val) {
      const opt = val
      let select = []
      if (val.as) {
        const asItems = val.as.split(',')
        select = val.seleteItem.split(',').map((field, i) => {
          return [
            {
              type: 'field',
              params: [field],
            },
            {
              type: opt.groupFunc || opt.selectType || 'mean',
              params: [],
            },
            {
              type: 'alias',
              params: [asItems[i]],
            },
          ]
        })
      } else {
        select = val.seleteItem.split(',').map((field) => {
          return [
            {
              type: 'field',
              params: [field],
            },
            {
              type: opt.groupFunc || opt.selectType || 'mean',
              params: [],
            },
            {
              type: 'alias',
              params: [field],
            },
          ]
        })
      }
      const tags = [
        {
          key: 'id',
          value: this.resId,
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
      return {
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
    },
  },
}
</script>

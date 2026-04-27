<template>
  <div>
    <dashboard-cards useLocalPanels :localPanels="localPanels" :createChart="noop" :adjustChartOrder="noop" :editChart="noop" />
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'

import { lbQuery } from './utils'

function pickSelectAliases (queryData) {
  const select = queryData?.metric_query?.[0]?.model?.select
  if (!Array.isArray(select)) return []
  const aliases = []
  select.forEach((chain) => {
    if (!Array.isArray(chain)) return
    const aliasStep =
      chain.findLast?.(s => s && typeof s === 'object' && s.type === 'alias') ||
      [...chain].reverse().find(s => s && typeof s === 'object' && s.type === 'alias')
    const name = aliasStep?.params?.[0]
    if (name) aliases.push(String(name))
  })
  return aliases
}

export default {
  name: 'LblistenerDashboardMonitor',
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
      noop: () => {},
    }
  },
  computed: {
    listenerType () {
      return String(this.data?.listener_type || '').toLowerCase()
    },
    localPanels () {
      return [
        this.genPanel('bps'),
        this.genPanel('rate'),
        this.genPanel('accident'),
      ].filter(Boolean)
    },
  },
  methods: {
    genPanel (fieldType) {
      if (!this.data?.id || !this.data?.listener_type) return null
      const isRule = this.data.type === 2
      const queryData = lbQuery({
        fieldType,
        lsType: this.listenerType,
        lsId: this.data.id,
        time: { from: 'now-1h' },
        aggregate: 'mean',
        isRule,
        scope: this.$store.getters.scope,
      })
      if (queryData) {
        delete queryData.signature
        delete queryData.from
        delete queryData.to
        delete queryData.interval
      }
      const aliases = pickSelectAliases(queryData)

      const panelNameMap = {
        bps: this.$t('network.text_488'),
        rate: this.$t('network.text_489'),
        accident: this.$t('network.text_490'),
      }
      const unitMap = {
        bps: 'bps',
        rate: 'count',
        accident: 'count',
      }
      return {
        panel_name: panelNameMap[fieldType] || fieldType,
        constants: {
          label: panelNameMap[fieldType] || fieldType,
          fromItem: 'haproxy',
          seleteItem: aliases.join(','),
          selectItem: aliases.join(','),
          unit: unitMap[fieldType] || '',
        },
        queryData,
      }
    },
  },
}
</script>

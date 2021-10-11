<template>
  <div>
    <a-icon type="sync" spin v-if="loading" />
    <a-row v-else type="flex" style="margin-left: 128px;">
      <a-col v-for="card in cards" :key="card.title" :span="8" style="width: 400px" class="mt-4">
        <overview-summary-card :card="card" @resourceClick="handleResClick" />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import OverviewSummaryCard from '../../../components/MonitorCard/sections/card'

const cardsTypeMap = {
  guest: {
    icon: 'res-vminstance',
    index: 1,
  },
  host: {
    icon: 'res-host',
    index: 2,
  },
  cloudaccount: {
    icon: 'res-cloudaccount',
    index: 3,
  },
  oss: {
    icon: 'res-bucket',
    index: 4,
  },
  storage: {
    icon: 'res-blockstorage',
    index: 5,
  },
  rds: {
    icon: 'res-rds',
    index: 6,
  },
  redis: {
    icon: 'res-redis',
    index: 7,
  },
}

export default {
  name: 'SummaryCards',
  components: { OverviewSummaryCard },
  props: {
    scope: {
      type: String,
    },
    scopeId: {
      type: String,
    },
  },
  data () {
    return {
      manager: new this.$Manager('monitorresources', 'v1'),
      loading: false,
      data: {},
    }
  },
  computed: {
    cards () {
      const cards = []
      for (const k in this.data) {
        const items = Object.assign({ alerting: 0, attach: 0, init: 0 }, this.data[k])
        const total = items.total || 0
        delete items.total
        // 项目视图不需要展示宿主机信息
        if (this.scope === 'project' && k === 'host') {
          continue
        }

        if (total === 0) {
          continue
        }

        const icon = cardsTypeMap[k]?.icon || `res-${k}`

        cards.push({
          title: this.$t(`dictionary.${k}`),
          icon: icon,
          total: total,
          items: items,
          index: cardsTypeMap[k]?.index || 10,
          resType: k,
        })
      }
      cards.sort((a, b) => { // 虚拟机和宿主机优先展示
        return a.index - b.index
      })
      return cards
    },
  },
  watch: {
    scopeId (val, oldVal) {
      if (val !== oldVal) {
        this.fetchData()
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const params = { scope: this.scope }
        if (this.scope === 'project' && this.scopeId) {
          params.project = this.scopeId
        }
        if (this.scope === 'domain' && this.scopeId) {
          params.domain = this.scopeId
        }
        const res = await this.manager.get({
          id: 'alert',
          params,
        })
        this.data = res.data
        this.loading = false
      } catch (e) {
        this.loading = false
        throw e
      }
    },
    handleResClick (res) {
      if (['guest', 'host'].includes(res.resType)) {
        this.$router.push({
          path: `/monitorresources-${res.resType}`,
          query: { defaultFilter: { alert_state: [res.alert_state] } },
        })
      }
    },
  },
}
</script>

<style scoped>

</style>

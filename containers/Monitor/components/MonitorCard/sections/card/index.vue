<template>
  <a-row type="flex" justify="start">
    <a-col :span="5" style="text-align: center;">
      <icon :type="card.icon" style="font-size: 48px;" />
      <div>{{ card.title }}</div>
      <div style="font-weight: bold; font-size: 24px;">{{ card.total }}<span v-if="card.unit" style="font-size: 12px;margin-left: 5px">{{ card.unit }}</span></div>
    </a-col>
    <a-col :span="11">
      <div v-for="(v, k) in card.items" :key="k" class="col d-flex align-items-center" style="padding-top: 8px;" @click="handleResClick(card, k)">
        <status :status="k" statusModule="monitorresources" style="display: inline-grid;" />
        <span :class="(['guest','host'].includes(card.resType)?'asA':'')">{{ (card.items[k] || 0) }}</span>
      </div>
    </a-col>
    <a-col v-if="card.total > 0">
      <div v-for="(v, k) in card.items" :key="'percent' + k" style="padding-top: 6px;">
        <a-tag color="blue">
          {{ (v * 100 / card.total).toFixed(0) + '%' }}
        </a-tag>
      </div>
    </a-col>
  </a-row>
</template>

<script>
import Status from '@/components/Status'

export default {
  name: 'OverviewSummaryCard',
  components: { Status },
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  methods: {
    handleResClick (res, alert_state) {
      this.$emit('resourceClick', { resType: res.resType, alert_state })
    },
  },
}
</script>

<style scoped>
.asA {
  cursor: pointer;
  color: var(--antd-wave-shadow-color);
}
</style>

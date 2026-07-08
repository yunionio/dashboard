<template>
  <div class="heatmap-wrapper">
    <a-spin :spinning="loading">
      <div class="heatmap-table" v-if="rows.length">
        <div class="heatmap-header">
          <div class="heatmap-cell corner">{{ $t('aice.aiproxy.usage.hour') }}\{{ $t('aice.aiproxy.usage.weekday') }}</div>
          <div
            class="heatmap-cell day-label"
            :class="{ highlight: hoverCol === h }"
            v-for="h in hourLabels"
            :key="'h' + h">{{ h }}</div>
        </div>
        <div
          class="heatmap-row"
          v-for="day in dayLabels"
          :key="day.key"
          @mouseenter="hoverRow = day.key"
          @mouseleave="hoverRow = null">
          <div class="heatmap-cell day-label" :class="{ highlight: hoverRow === day.key }">{{ day.label }}</div>
          <div
            class="heatmap-cell data-cell"
            :class="{ highlight: hoverCol === h || hoverRow === day.key }"
            v-for="h in hourLabels"
            :key="'d' + day.key + 'h' + h"
            :style="{ backgroundColor: getColor(day.key, h) }"
            :title="`${day.label} ${h}:00 — ${getValue(day.key, h)}`"
            @mouseenter="hoverCol = h"
            @mouseleave="hoverCol = null">
            <span class="cell-text">{{ getValue(day.key, h) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="no-data">{{ $t('aice.aiproxy.usage.no_events') }}</div>
    </a-spin>
  </div>
</template>

<script>
import { buildLocalHeatmapMatrix } from '../utils/transformChart'

export default {
  name: 'AiproxyUsageHeatmapChart',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default: () => [],
    },
    valueKey: {
      type: String,
      default: 'request_count',
    },
  },
  data () {
    return {
      hourLabels: Array.from({ length: 24 }, (_, i) => i),
      hoverCol: null,
      hoverRow: null,
    }
  },
  computed: {
    localHeatmap () {
      return buildLocalHeatmapMatrix(this.data, this.valueKey)
    },
    matrix () {
      return this.localHeatmap.matrix
    },
    maxVal () {
      return this.localHeatmap.maxVal
    },
    dayLabels () {
      const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const labels = {
        Monday: '星期一',
        Tuesday: '星期二',
        Wednesday: '星期三',
        Thursday: '星期四',
        Friday: '星期五',
        Saturday: '星期六',
        Sunday: '星期日',
      }
      return order.map(key => ({ key, label: labels[key] || key }))
    },
    rows () {
      return this.dayLabels
    },
  },
  methods: {
    getValue (day, hour) {
      const val = this.matrix[day]?.[hour]
      return val != null ? val : 0
    },
    getColor (day, hour) {
      const val = this.matrix[day]?.[hour]
      if (val == null || val === 0) return ''
      const intensity = Math.min(val / this.maxVal, 1)
      // Blue gradient based on intensity
      const r = Math.round(230 - intensity * 180)
      const g = Math.round(240 - intensity * 120)
      const b = 255
      return `rgb(${r}, ${g}, ${b})`
    },
  },
}
</script>

<style lang="less" scoped>
.heatmap-wrapper {
  padding: 8px 0;
  overflow-x: auto;
}
.heatmap-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}
.heatmap-header,
.heatmap-row {
  display: table-row;
}
.heatmap-cell {
  display: table-cell;
  border: 1px solid #f0f0f0;
  padding: 4px 6px;
  text-align: center;
  vertical-align: middle;
  min-width: 32px;
  background-color: #f5f5f5;
  &.corner {
    background: #fafafa;
    font-weight: 500;
    white-space: nowrap;
    min-width: 80px;
  }
  &.day-label {
    background: #fafafa;
    font-weight: 500;
    text-align: center;
    white-space: nowrap;
  }
  &.data-cell {
    cursor: default;
    position: relative;
  }
  &.highlight {
    background-color: #e6f0ff;
  }
}
.cell-text {
  color: rgba(0, 0, 0, 0.65);
  font-size: 11px;
}
.no-data {
  padding: 24px 0;
  text-align: center;
  color: #bfbfbf;
}
</style>

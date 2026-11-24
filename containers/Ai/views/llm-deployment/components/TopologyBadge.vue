<template>
  <span class="d-flex align-items-center flex-wrap">
    <a-tag :color="modeColor" class="mr-1">{{ badgeText }}</a-tag>
    <span v-if="showLayout" class="text-color-help">{{ layoutText }}</span>
  </span>
</template>

<script>
import { getParallelModeShortLabel } from '../utils/topology'

export default {
  name: 'LlmDeploymentTopologyBadge',
  props: {
    mode: {
      type: String,
      default: 'pp',
    },
    tp: {
      type: Number,
      default: 0,
    },
    pp: {
      type: Number,
      default: 0,
    },
    dp: {
      type: Number,
      default: 0,
    },
    nnodes: {
      type: Number,
      default: 0,
    },
    gpusPerNode: {
      type: Number,
      default: 0,
    },
    showLayout: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    modeColor () {
      if (this.mode === 'dp') return 'blue'
      return 'purple'
    },
    badgeText () {
      return getParallelModeShortLabel(this.mode)
    },
    layoutText () {
      const parts = []
      const totalGpus = (this.nnodes || 1) * (this.gpusPerNode || 0)
      if (this.tp > 0) parts.push(`TP=${this.tp}`)
      if (this.pp > 0) parts.push(`PP=${this.pp}`)
      if (this.dp > 0) parts.push(`DP=${this.dp}`)
      if (this.nnodes > 1) {
        return `${this.nnodes} × ${this.gpusPerNode} · ${parts.join(' / ')}`
      }
      if (totalGpus > 0 && parts.length) {
        return `${totalGpus} GPU · ${parts.join(' / ')}`
      }
      return ''
    },
  },
}
</script>

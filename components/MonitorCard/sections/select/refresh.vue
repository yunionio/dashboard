<template>
  <div style="padding: 2px;display: inline;">
    <a-tooltip placement="top">
      <template slot="title" v-show="tooltips && lastSync !== ''">
        <span>{{ $t('refresh.last_sync_at', [lastSync]) }}</span>
      </template>
      <a-button style="width: 45px;padding-left: 15px;padding-right: 15px;" :icon="loading ? 'loading':'sync'" @click="emitRefresh" />
    </a-tooltip>
    <a-select v-if="showSelect" v-model="syncConfig.duration" @change="handleChange" style="width: 90px">
      <a-select-option :dropdownMatchSelectWidth="false" v-for="d of durations" :key="d.label" :value="d.value">
        {{ d.label }}
      </a-select-option>
    </a-select>
  </div>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'refresh',
  props: {
    value: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    tooltips: {
      type: Boolean,
      default: true,
    },
    showSelect: {
      type: Boolean,
      default: false,
    },
    durations: {
      type: Array,
      default: () => {
        return [
          { label: i18n.t('refresh.auto.disable'), value: 0 },
          { label: i18n.t('refresh.duration.seconds', [5]), value: 5 },
          { label: i18n.t('refresh.duration.seconds', [10]), value: 10 },
          { label: i18n.t('refresh.duration.seconds', [30]), value: 30 },
          { label: i18n.t('refresh.duration.minutes', [1]), value: 60 },
          { label: i18n.t('refresh.duration.minutes', [5]), value: 300 },
          { label: i18n.t('refresh.duration.minutes', [15]), value: 900 },
          { label: i18n.t('refresh.duration.minutes', [30]), value: 1800 },
          { label: i18n.t('refresh.duration.hours', [1]), value: 3600 },
          { label: i18n.t('refresh.duration.hours', [2]), value: 7200 },
          { label: i18n.t('refresh.duration.days', [1]), value: 86400 },
        ]
      },
    },
  },
  data () {
    let timer
    if (this.value > 0) {
      timer = setInterval(this.emitRefresh, this.value * 1000)
    }
    return {
      lastSync: '',
      timer: timer,
      syncConfig: {
        enable: false,
        duration: this.value,
      },
    }
  },
  beforeDestroy () {
    this.cancelAutoRefresh()
  },
  methods: {
    emitRefresh () {
      this.lastSync = new Date().toLocaleTimeString()
      if (this.loading) {
        return
      }
      this.$emit('refresh')
    },
    handleChange (v) {
      this.syncConfig.duration = v
      this.syncConfig.enable = v > 0
      this.syncConfig.enable ? this.resetAutoRefresh(v) : this.cancelAutoRefresh()
      this.emitRefresh()
    },
    resetAutoRefresh (v) {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(this.emitRefresh, v * 1000)
    },
    cancelAutoRefresh () {
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
  },
}
</script>

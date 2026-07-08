<template>
  <a-row :gutter="16" class="stat-cards-row">
    <a-col :span="4" v-for="card in cards" :key="card.key">
      <div class="stat-card" :class="{ 'is-loading': loading }">
        <div class="stat-card-label">{{ card.label }}</div>
        <div class="stat-card-value">
          <span v-if="!loading">{{ card.value }}</span>
          <a-spin v-else size="small" />
        </div>
        <div class="stat-card-sub">{{ card.sub || '\u00A0' }}</div>
      </div>
    </a-col>
  </a-row>
</template>

<script>
import numerify from 'numerify'

export default {
  name: 'AiproxyUsageStatCards',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    overviewData: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    usage () {
      return (this.overviewData || {}).usage || {}
    },
    summary () {
      return (this.overviewData || {}).summary || {}
    },
    cards () {
      const { request_count = 0, success_count = 0, failure_count = 0, token_count = 0, input_tokens = 0, output_tokens = 0 } = this.usage
      const { rpm = 0, tpm = 0, avg_latency_ms = null } = this.summary
      const total = request_count || 1
      const successRate = total > 0 ? ((success_count / total) * 100).toFixed(1) + '%' : '-'
      return [
        { key: 'request_count', label: this.$t('aice.aiproxy.usage.request_count'), value: numerify(request_count), sub: `${this.$t('aice.aiproxy.usage.success')} ${numerify(success_count)}, ${this.$t('aice.aiproxy.usage.failed')} ${numerify(failure_count)}` },
        { key: 'success_rate', label: this.$t('aice.aiproxy.usage.request_success_rate'), value: successRate },
        { key: 'avg_latency', label: this.$t('aice.aiproxy.usage.avg_latency'), value: avg_latency_ms != null ? this.formatDuration(avg_latency_ms) : '-' },
        { key: 'token_count', label: this.$t('aice.aiproxy.usage.token_count'), value: numerify(token_count), sub: `Input: ${numerify(input_tokens)}, Output: ${numerify(output_tokens)}` },
        { key: 'rpm', label: this.$t('aice.aiproxy.usage.rpm'), value: numerify(rpm) },
        { key: 'tpm', label: this.$t('aice.aiproxy.usage.tpm'), value: numerify(tpm) },
      ]
    },
  },
  methods: {
    formatDuration (ms) {
      if (ms == null) return '-'
      if (ms < 1000) return ms.toFixed(0) + 'ms'
      if (ms < 60000) return (ms / 1000).toFixed(2) + 's'
      return (ms / 60000).toFixed(2) + 'min'
    },
  },
}
</script>

<style lang="less" scoped>
.stat-cards-row {
  margin-bottom: 0;
}
.stat-card {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  background: #fff;
  transition: box-shadow 0.3s;
  min-height: 100px;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  &.is-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
.stat-card-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 8px;
}
.stat-card-value {
  font-size: 28px;
  font-weight: 600;
  color: #262626;
  line-height: 1.2;
}
.stat-card-sub {
  font-size: 12px;
  color: #bfbfbf;
  margin-top: 6px;
}
</style>

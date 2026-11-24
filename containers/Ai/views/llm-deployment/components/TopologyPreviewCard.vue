<template>
  <a-card
    size="small"
    :title="$t('aice.llm_deployment.topology_preview.title')"
    :loading="loading"
    class="topology-preview-card"
    :class="{ 'is-error': !schedulable }">
    <div v-if="!skuId" class="text-color-help">{{ $t('aice.llm_deployment.topology_preview.select_sku') }}</div>

    <template v-else-if="result">
      <div class="d-flex align-items-center flex-wrap mb-2">
        <topology-badge
          :mode="result.parallel_mode || 'pp'"
          :tp="result.tensor_parallel_size"
          :pp="result.pipeline_parallel_size"
          :dp="result.data_parallel_size"
          :nnodes="result.distributed_nnodes"
          :gpus-per-node="result.gpus_per_node" />
        <span
          v-if="result.dist_shape"
          class="text-color-help ml-2">{{ shapeLabel }}</span>
      </div>

      <div v-if="summary" class="mb-2 text-color-help">{{ summary }}</div>

      <div v-if="hosts.length" class="topology-hosts">
        <div class="text-color-help mb-1">{{ $t('aice.llm_deployment.topology_preview.selected_hosts') }}</div>
        <div class="host-grid">
          <div
            v-for="(host, idx) in hosts"
            :key="host.host_id || idx"
            class="host-item">
            <div class="host-name">{{ host.host_name || host.host_id || '-' }}</div>
            <div class="host-meta">
              <span v-if="host.gpu_available">{{ host.gpu_available }} GPU</span>
              <span v-if="host.best_gpu_model">{{ host.best_gpu_model }}</span>
            </div>
          </div>
        </div>
      </div>

      <a-alert
        v-if="!schedulable"
        type="error"
        :message="reason"
        show-icon
        class="mt-2" />
      <a-alert
        v-else-if="warning"
        type="warning"
        :message="warning"
        show-icon
        class="mt-2" />
    </template>
  </a-card>
</template>

<script>
import { checkSkuSchedulable } from '@Ai/utils/skuSchedulableCheck'
import { formatTopologySummary, formatTopologyReason, getShapeLabel } from '../utils/topology'
import TopologyBadge from './TopologyBadge'

function normalizeParallelMode (mode, llmType) {
  if (!mode) return 'pp'
  if (llmType === 'sglang') return 'pp'
  return mode
}

function asArray (value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  return [value]
}

export default {
  name: 'LlmDeploymentTopologyPreviewCard',
  components: { TopologyBadge },
  props: {
    skuManager: {
      type: Object,
      required: true,
    },
    skuId: {
      type: String,
      default: '',
    },
    skuDetail: {
      type: Object,
      default: null,
    },
    distributedInference: {
      type: Boolean,
      default: false,
    },
    parallelMode: {
      type: String,
      default: 'pp',
    },
    nnodes: {
      type: [Number, String],
      default: null,
    },
    pipelineParallelSize: {
      type: [Number, String],
      default: null,
    },
    placementStrategy: {
      type: String,
      default: 'spread',
    },
    preferHosts: {
      type: [Array, String],
      default: () => [],
    },
  },
  data () {
    return {
      loading: false,
      result: null,
      timer: null,
    }
  },
  computed: {
    llmType () {
      return this.skuDetail?.llm_type || ''
    },
    normalizedMode () {
      return normalizeParallelMode(this.parallelMode, this.llmType)
    },
    schedulable () {
      return !!this.result?.schedulable
    },
    summary () {
      if (!this.result) return ''
      return formatTopologySummary(this.result)
    },
    reason () {
      if (!this.result) return ''
      return formatTopologyReason(this.result)
    },
    warning () {
      if (!this.result?.schedulable) return ''
      if (this.normalizedMode === 'dp' && this.result.distributed_nnodes <= 1) {
        return this.$t('aice.llm_deployment.topology_preview.dp_single_host')
      }
      return ''
    },
    hosts () {
      return asArray(this.result?.hosts)
    },
    shapeLabel () {
      return getShapeLabel(this.result?.dist_shape)
    },
  },
  watch: {
    skuId () {
      this.debouncedCheck()
    },
    distributedInference () {
      this.debouncedCheck()
    },
    parallelMode () {
      this.debouncedCheck()
    },
    nnodes () {
      this.debouncedCheck()
    },
    pipelineParallelSize () {
      this.debouncedCheck()
    },
    placementStrategy () {
      this.debouncedCheck()
    },
    preferHosts () {
      this.debouncedCheck()
    },
  },
  mounted () {
    this.debouncedCheck()
  },
  beforeDestroy () {
    if (this.timer) clearTimeout(this.timer)
  },
  methods: {
    debouncedCheck () {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => this.runCheck(), 300)
    },
    async runCheck () {
      if (!this.skuId) {
        this.result = null
        return
      }
      const mode = this.normalizedMode
      const payload = {
        distributed_inference: !!this.distributedInference,
        parallel_mode: mode,
        prefer_hosts: asArray(this.preferHosts),
        placement_strategy: this.placementStrategy || 'spread',
        nnodes: this.toInt(this.nnodes) || 0,
        pipeline_parallel_size: this.toInt(this.pipelineParallelSize) || 0,
      }
      this.loading = true
      try {
        const { data } = await checkSkuSchedulable(this.skuManager, this.skuId, payload)
        this.result = data || null
      } catch (error) {
        this.result = {
          schedulable: false,
          reason: error?.message || this.$t('aice.llm_deployment.create.schedulable_check.failed'),
        }
      } finally {
        this.loading = false
      }
    },
    toInt (value) {
      if (value === null || value === undefined || value === '') return 0
      const n = Number(value)
      return Number.isNaN(n) ? 0 : n
    },
  },
}
</script>

<style lang="less" scoped>
.topology-preview-card {
  .host-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
  .host-item {
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    padding: 8px;
    .host-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .host-meta {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.45);
      span {
        margin-right: 8px;
      }
    }
  }
  &.is-error {
    border-color: #ff4d4f;
  }
}
</style>

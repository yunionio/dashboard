<template>
  <div>
    <page-header :title="$t('aice.llm_benchmark_create')" />
    <page-body needMarginBottom>
      <a-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 16 }"
        class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('validator.resourceName')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_benchmark.target_type')">
          <a-radio-group v-model="form.target_type">
            <a-radio value="internal">{{ $t('aice.llm_benchmark.target.internal') }}</a-radio>
            <a-radio value="external">{{ $t('aice.llm_benchmark.target.external') }}</a-radio>
          </a-radio-group>
        </a-form-model-item>
        <a-form-model-item v-if="form.target_type === 'internal'" :label="$t('aice.llm_benchmark.deployment')" prop="llm_deployment_id">
          <base-select
            v-model="form.llm_deployment_id"
            resource="llm_deployments"
            version="v2"
            :params="deploymentParams"
            :mapper="deploymentMapper"
            :label-format="deploymentLabelFormat"
            filterable
            @change="handleDeploymentChange" />
        </a-form-model-item>
        <template v-else>
          <a-form-model-item :label="$t('aice.llm_benchmark.target_url')" prop="target_url">
            <a-input v-model="form.target_url" placeholder="http://host:port" />
            <template v-slot:extra>{{ $t('aice.llm_benchmark.create.target_url_help') }}</template>
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.llm_benchmark.api_key')">
            <a-input v-model="form.api_key" type="password" autocomplete="new-password" />
            <template v-slot:extra>{{ $t('aice.llm_benchmark.create.api_key_help') }}</template>
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.llm_benchmark.model')" prop="model">
            <a-row :gutter="8" type="flex">
              <a-col flex="auto">
                <a-select
                  v-model="form.model"
                  class="w-100"
                  show-search
                  option-filter-prop="children"
                  :disabled="!modelOptions.length"
                  :placeholder="$t('common.tips.select', [$t('aice.llm_benchmark.model')])">
                  <a-select-option v-for="item in modelOptions" :key="item" :value="item">{{ item }}</a-select-option>
                </a-select>
              </a-col>
              <a-col>
                <a-button :loading="modelsLoading" @click="loadModels">{{ $t('aice.llm_benchmark.create.load_models') }}</a-button>
              </a-col>
            </a-row>
            <template v-slot:extra>{{ $t('aice.llm_benchmark.create.model_help') }}</template>
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.llm_benchmark.tokenizer')" prop="tokenizer">
            <a-radio-group v-model="form.tokenizer_mode">
              <a-radio value="search">{{ $t('aice.llm_benchmark.create.tokenizer_mode_search') }}</a-radio>
              <a-radio value="manual">{{ $t('aice.llm_benchmark.create.tokenizer_mode_manual') }}</a-radio>
            </a-radio-group>
            <template v-if="form.tokenizer_mode === 'search'">
              <a-input
                v-model="tokenizerQuery"
                class="mt-2"
                :placeholder="$t('aice.llm_benchmark.create.tokenizer_query_placeholder')" />
              <a-select
                v-model="form.tokenizer"
                class="w-100 mt-2"
                :loading="tokenizerSearching"
                :disabled="!tokenizerOptions.length"
                :placeholder="$t('aice.llm_benchmark.create.tokenizer_select_placeholder')">
                <a-select-option v-for="item in tokenizerOptions" :key="item.model_id" :value="item.model_id">
                  {{ tokenizerLabel(item) }}
                </a-select-option>
              </a-select>
              <div v-if="tokenizerSearchError" class="text-danger mt-1">{{ tokenizerSearchError }}</div>
              <div v-else-if="tokenizerSearchEmpty" class="mt-1">{{ $t('aice.llm_benchmark.create.tokenizer_no_match') }}</div>
            </template>
            <a-input
              v-else
              v-model="form.tokenizer"
              class="mt-2"
              placeholder="Qwen/Qwen3-8B" />
            <template v-slot:extra>{{ tokenizerHelp }}</template>
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.llm_benchmark.network')" prop="network_id">
            <base-select
              v-model="form.network_id"
              resource="networks"
              :params="networkParams"
              :select-props="{ placeholder: $t('common.tips.select', [$t('aice.llm_benchmark.network')]) }" />
            <template v-slot:extra>{{ $t('aice.llm_benchmark.create.network_help') }}</template>
          </a-form-model-item>
        </template>
        <a-divider orientation="left">{{ $t('aice.llm_benchmark.params') }}</a-divider>
        <a-form-model-item :label="$t('aice.llm_benchmark.profile')" prop="profile">
          <a-select v-model="form.profile" class="w-100">
            <a-select-option v-for="item in profileOptions" :key="item" :value="item">
              {{ $t(`aice.llm_benchmark.profile.${item}`) }}
            </a-select-option>
          </a-select>
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.profile_help') }}</template>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_benchmark.request_rate')" prop="request_rate">
          <a-input-number v-model="form.request_rate" :min="0.1" :step="0.1" class="w-100" />
          <template v-slot:extra>{{ requestRateHelp }}</template>
        </a-form-model-item>
        <a-form-model-item v-if="form.profile === 'constant'" :label="$t('aice.llm_benchmark.warmup_requests')" prop="warmup_requests">
          <a-input-number v-model="form.warmup_requests" :min="0" :step="1" class="w-100" />
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.warmup_requests_help') }}</template>
        </a-form-model-item>
        <template v-if="form.profile === 'slo'">
          <a-form-model-item :label="$t('aice.llm_benchmark.slo_avg_ttft_ms')">
            <a-input-number v-model="form.slo_avg_ttft_ms" :min="1" :step="1" class="w-100" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.llm_benchmark.slo_avg_tpot_ms')">
            <a-input-number v-model="form.slo_avg_tpot_ms" :min="1" :step="1" class="w-100" />
          </a-form-model-item>
          <a-form-model-item :label="$t('aice.llm_benchmark.slo_avg_latency_ms')">
            <a-input-number v-model="form.slo_avg_latency_ms" :min="1" :step="1" class="w-100" />
            <template v-slot:extra>{{ $t('aice.llm_benchmark.create.slo_help') }}</template>
          </a-form-model-item>
        </template>
        <a-form-model-item :label="$t('aice.llm_benchmark.total_requests')" prop="total_requests">
          <a-input-number v-model="form.total_requests" :min="1" :step="1" class="w-100" />
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.total_requests_help') }}</template>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_benchmark.max_duration_seconds')" prop="max_duration_seconds">
          <a-input-number v-model="form.max_duration_seconds" :min="1" :step="1" class="w-100" />
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.max_duration_seconds_help') }}</template>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_benchmark.max_errors')" prop="max_errors">
          <a-input-number v-model="form.max_errors" :min="0" :step="1" class="w-100" />
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.max_errors_help') }}</template>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_benchmark.dataset_input_tokens')" prop="dataset_input_tokens">
          <a-input-number v-model="form.dataset_input_tokens" :min="1" :step="1" class="w-100" />
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.dataset_input_tokens_help') }}</template>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_benchmark.dataset_output_tokens')" prop="dataset_output_tokens">
          <a-input-number v-model="form.dataset_output_tokens" :min="1" :step="1" class="w-100" />
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.dataset_output_tokens_help') }}</template>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_benchmark.keep_runner')">
          <a-checkbox v-model="form.keep_runner">{{ $t('aice.llm_benchmark.create.keep_runner_help') }}</a-checkbox>
        </a-form-model-item>
      </a-form-model>
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('common.create') }}</a-button>
        <a-button class="ml-2" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import { BENCHMARK_DEFAULTS, BENCHMARK_PROFILE_OPTIONS, BENCHMARK_TERMINAL_STATES, isBenchmarkableDeployment } from '../constants'

export default {
  name: 'LlmBenchmarkCreate',
  mixins: [WindowsMixin],
  data () {
    return {
      loading: false,
      modelsLoading: false,
      modelOptions: [],
      tokenizerQuery: '',
      tokenizerOptions: [],
      tokenizerSearching: false,
      tokenizerSearchEmpty: false,
      tokenizerSearchError: '',
      tokenizerTimer: null,
      form: {
        name: '',
        target_type: 'internal',
        llm_deployment_id: undefined,
        target_url: '',
        model: '',
        api_key: '',
        tokenizer_mode: 'search',
        tokenizer: '',
        network_id: undefined,
        keep_runner: false,
        ...BENCHMARK_DEFAULTS,
      },
      profileOptions: BENCHMARK_PROFILE_OPTIONS,
      rules: {
        name: [{ required: true, validator: this.$validate('resourceName') }],
        llm_deployment_id: [{ validator: this.validateDeployment }],
        target_url: [{ validator: this.validateTargetUrl }],
        model: [{ validator: this.validateExternalModel }],
        tokenizer: [{ validator: this.validateTokenizer }],
        network_id: [{ validator: this.validateNetwork }],
        request_rate: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_benchmark.request_rate')]) }],
        total_requests: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_benchmark.total_requests')]) }],
        max_duration_seconds: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_benchmark.max_duration_seconds')]) }],
        max_errors: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_benchmark.max_errors')]) }],
        dataset_input_tokens: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_benchmark.dataset_input_tokens')]) }],
        dataset_output_tokens: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_benchmark.dataset_output_tokens')]) }],
      },
    }
  },
  computed: {
    requestRateHelp () {
      if (this.form.profile === 'constant') return this.$t('aice.llm_benchmark.create.request_rate_help')
      return this.$t('aice.llm_benchmark.create.request_rate_floor_help')
    },
    tokenizerHelp () {
      if (this.form.tokenizer_mode === 'manual') return this.$t('aice.llm_benchmark.create.tokenizer_manual_help')
      return this.$t('aice.llm_benchmark.create.tokenizer_search_help')
    },
    deploymentParams () {
      return {
        details: true,
        scope: this.$store.getters.scope,
      }
    },
    networkParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        host_type: 'container',
        filter: 'server_type.in(guest,hostlocal)',
      }
    },
  },
  watch: {
    'form.target_url' () {
      this.resetModelOptions()
    },
    'form.api_key' () {
      this.resetModelOptions()
    },
    tokenizerQuery () {
      this.scheduleTokenizerSearch()
    },
    'form.model' (value) {
      this.fillTokenizerQuery(value)
    },
    'form.tokenizer_mode' () {
      this.resetTokenizerInput()
      if (this.form.tokenizer_mode === 'search') this.fillTokenizerQuery(this.form.model)
    },
  },
  beforeDestroy () {
    if (this.tokenizerTimer) clearTimeout(this.tokenizerTimer)
  },
  methods: {
    deploymentMapper (list = []) {
      return list.filter(isBenchmarkableDeployment)
    },
    deploymentLabelFormat (item = {}) {
      const parts = [
        item.name || item.id,
        item.backend,
        item.llm_sku,
      ].filter(Boolean)
      return parts.join(' / ')
    },
    validateDeployment (rule, value, callback) {
      if (this.form.target_type === 'external' || value) return callback()
      callback(new Error(this.$t('common.tips.select', [this.$t('aice.llm_benchmark.deployment')])))
    },
    validateTargetUrl (rule, value, callback) {
      if (this.form.target_type !== 'external') return callback()
      const url = (value || '').trim()
      if (/^https?:\/\/.+/i.test(url)) return callback()
      callback(new Error(this.$t('common.tips.input', [this.$t('aice.llm_benchmark.target_url')])))
    },
    resetModelOptions () {
      this.modelOptions = []
      this.form.model = ''
    },
    async loadModels () {
      const url = (this.form.target_url || '').trim()
      const apiKey = this.form.api_key || ''
      if (!/^https?:\/\/.+/i.test(url)) {
        this.$message.warning(this.$t('common.tips.input', [this.$t('aice.llm_benchmark.target_url')]))
        return
      }
      this.modelsLoading = true
      try {
        const data = { target_url: url }
        if (apiKey) data.api_key = apiKey
        const { data: result } = await new this.$Manager('llm_benchmarks').performClassAction({
          action: 'list-models',
          data,
          timeout: 20000,
        })
        if ((this.form.target_url || '').trim() !== url || (this.form.api_key || '') !== apiKey) return
        const models = (result && result.models) || []
        this.modelOptions = models
        this.form.model = models.length === 1 ? models[0] : ''
      } finally {
        this.modelsLoading = false
      }
    },
    validateExternalModel (rule, value, callback) {
      if (this.form.target_type !== 'external' || (value || '').trim()) return callback()
      callback(new Error(this.$t('common.tips.input', [this.$t('aice.llm_benchmark.model')])))
    },
    validateTokenizer (rule, value, callback) {
      if (this.form.target_type !== 'external' || (value || '').trim()) return callback()
      const label = this.$t('aice.llm_benchmark.tokenizer')
      if (this.form.tokenizer_mode === 'search') {
        callback(new Error(this.$t('common.tips.select', [label])))
        return
      }
      callback(new Error(this.$t('common.tips.input', [label])))
    },
    tokenizerLabel (item = {}) {
      if (item.name && item.name !== item.model_id) return `${item.model_id} (${item.name})`
      return item.model_id
    },
    fillTokenizerQuery (value) {
      if (this.form.target_type !== 'external' || this.form.tokenizer_mode !== 'search') return
      const q = (value || '').trim()
      if (!q || this.tokenizerQuery === q) return
      this.tokenizerQuery = q
    },
    resetTokenizerInput () {
      if (this.tokenizerTimer) {
        clearTimeout(this.tokenizerTimer)
        this.tokenizerTimer = null
      }
      this.tokenizerQuery = ''
      this.tokenizerOptions = []
      this.tokenizerSearching = false
      this.tokenizerSearchEmpty = false
      this.tokenizerSearchError = ''
      this.form.tokenizer = ''
    },
    scheduleTokenizerSearch () {
      if (this.form.tokenizer_mode !== 'search') return
      if (this.tokenizerTimer) clearTimeout(this.tokenizerTimer)
      this.form.tokenizer = ''
      this.tokenizerOptions = []
      this.tokenizerSearchEmpty = false
      this.tokenizerSearchError = ''
      const q = (this.tokenizerQuery || '').trim()
      if (q.length < 2) {
        this.tokenizerSearching = false
        return
      }
      this.tokenizerTimer = setTimeout(() => this.searchTokenizers(q), 300)
    },
    async searchTokenizers (q) {
      this.tokenizerSearching = true
      this.tokenizerSearchError = ''
      this.tokenizerSearchEmpty = false
      try {
        const { data: result } = await new this.$Manager('llm_benchmarks').get({
          id: 'tokenizer-search',
          params: { q, page_size: 20 },
        })
        if (this.form.tokenizer_mode !== 'search' || (this.tokenizerQuery || '').trim() !== q) return
        const tokenizers = (result && result.tokenizers) || []
        this.tokenizerOptions = tokenizers
        this.tokenizerSearchEmpty = tokenizers.length === 0
      } catch (e) {
        if (this.form.tokenizer_mode !== 'search' || (this.tokenizerQuery || '').trim() !== q) return
        this.tokenizerOptions = []
        this.tokenizerSearchEmpty = false
        this.tokenizerSearchError = this.$t('aice.llm_benchmark.create.tokenizer_search_failed')
      } finally {
        if ((this.tokenizerQuery || '').trim() === q) this.tokenizerSearching = false
      }
    },
    validateNetwork (rule, value, callback) {
      if (this.form.target_type !== 'external' || value) return callback()
      callback(new Error(this.$t('common.tips.select', [this.$t('aice.llm_benchmark.network')])))
    },
    handleDeploymentChange (val) {
      if (!val || this.form.name) return
      this.form.name = `bench-${val}`
    },
    handleCancel () {
      this.$router.push({ name: 'LlmBenchmarkList' })
    },
    buildPayload () {
      const {
        profile,
        request_format,
        dataset_name,
        name,
        llm_deployment_id,
        request_rate,
        warmup_requests,
        slo_avg_ttft_ms,
        slo_avg_tpot_ms,
        slo_avg_latency_ms,
        total_requests,
        max_duration_seconds,
        max_errors,
        dataset_input_tokens,
        dataset_output_tokens,
        keep_runner,
      } = this.form
      const payload = {
        name,
        profile,
        request_format,
        dataset_name,
        request_rate: Number(request_rate),
        warmup_requests: profile === 'constant' ? Number(warmup_requests || 0) : 0,
        ...(profile === 'slo' ? {
          slo_avg_ttft_ms: Number(slo_avg_ttft_ms) || 0,
          slo_avg_tpot_ms: Number(slo_avg_tpot_ms) || 0,
          slo_avg_latency_ms: Number(slo_avg_latency_ms) || 0,
        } : {}),
        total_requests,
        max_duration_seconds,
        max_errors,
        dataset_input_tokens,
        dataset_output_tokens,
        keep_runner: !!keep_runner,
      }
      if (this.form.target_type === 'external') {
        payload.target_url = this.form.target_url.trim()
        payload.model = this.form.model.trim()
        payload.network_id = this.form.network_id
        if (this.form.api_key) payload.api_key = this.form.api_key
        if ((this.form.tokenizer || '').trim()) payload.tokenizer = this.form.tokenizer.trim()
        return payload
      }
      payload.llm_deployment_id = llm_deployment_id
      return payload
    },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const manager = new this.$Manager('llm_benchmarks')
        const { data } = await manager.create({ data: this.buildPayload() })
        this.$router.push({ name: 'LlmBenchmarkList' })
        if (data?.id) {
          this.sidePageTriggerHandle(this, 'LlmBenchmarkSidePage', {
            id: data.id,
            resource: 'llm_benchmarks',
            steadyStatus: { state: BENCHMARK_TERMINAL_STATES },
            getParams: () => ({ details: true, scope: this.$store.getters.scope }),
          })
        }
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

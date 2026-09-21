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
        <a-form-model-item :label="$t('aice.llm_benchmark.deployment')" prop="llm_deployment_id">
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
        <a-divider orientation="left">{{ $t('aice.llm_benchmark.params') }}</a-divider>
        <a-form-model-item :label="$t('aice.llm_benchmark.request_rate')" prop="request_rate">
          <a-input-number v-model="form.request_rate" :min="0.1" :step="0.1" class="w-100" />
          <template v-slot:extra>{{ $t('aice.llm_benchmark.create.request_rate_help') }}</template>
        </a-form-model-item>
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
import { BENCHMARK_DEFAULTS, BENCHMARK_TERMINAL_STATES, isBenchmarkableDeployment } from '../constants'

export default {
  name: 'LlmBenchmarkCreate',
  mixins: [WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        name: '',
        llm_deployment_id: undefined,
        ...BENCHMARK_DEFAULTS,
      },
      rules: {
        name: [{ required: true, validator: this.$validate('resourceName') }],
        llm_deployment_id: [{
          required: true,
          message: this.$t('common.tips.select', [this.$t('aice.llm_benchmark.deployment')]),
        }],
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
    deploymentParams () {
      return {
        details: true,
        scope: this.$store.getters.scope,
      }
    },
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
        total_requests,
        max_duration_seconds,
        max_errors,
        dataset_input_tokens,
        dataset_output_tokens,
      } = this.form
      return {
        name,
        llm_deployment_id,
        profile,
        request_format,
        dataset_name,
        request_rate,
        total_requests,
        max_duration_seconds,
        max_errors,
        dataset_input_tokens,
        dataset_output_tokens,
      }
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

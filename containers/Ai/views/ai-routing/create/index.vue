<template>
  <div>
    <page-header :title="$t('common.create') + $t('aice.aiproxy.routing')" />
    <page-body needMarginBottom>
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" class="mt-4">
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.model_pattern')" prop="model_pattern">
          <a-input v-model="form.model_pattern" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.priority')">
          <a-input-number v-model="form.priority" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.ai_proxy_node_id')">
          <base-select v-model="form.ai_proxy_node_id" resource="ai_proxy_nodes" :params="{ scope: $store.getters.scope }" filterable version="v2" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.llm_deployment_id')">
          <a-input v-model="form.llm_deployment_id" />
        </a-form-model-item>
        <a-divider orientation="left">{{ $t('aice.aiproxy.routing_models') }}</a-divider>
        <div v-for="(item, index) in models" :key="item._key">
          <model-binding-row :item="item" :index="index" @remove="removeModel" />
        </div>
        <a-button type="dashed" icon="plus" block class="mb-4" @click="addModel">{{ $t('aice.aiproxy.add_model_binding') }}</a-button>
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
import { validateModelForm } from '@/utils/validate'
import ModelBindingRow from '../components/ModelBindingRow'

let keySeq = 0

export default {
  name: 'AiRoutingCreate',
  components: { ModelBindingRow },
  data () {
    return {
      loading: false,
      form: {
        generate_name: '',
        model_pattern: '',
        priority: 0,
        ai_proxy_node_id: '',
        llm_deployment_id: '',
      },
      models: [this.newModel()],
      rules: {
        generate_name: [{ required: true, validator: this.$validate('resourceName') }],
        model_pattern: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.model_pattern')]) }],
      },
    }
  },
  methods: {
    newModel () {
      return {
        _key: ++keySeq,
        ai_provider_id: '',
        ai_model_id: '',
        priority: 0,
        model_pattern: '',
        llm_id: '',
      }
    },
    addModel () {
      this.models.push(this.newModel())
    },
    removeModel (index) {
      if (this.models.length > 1) this.models.splice(index, 1)
    },
    handleCancel () {
      this.$router.push('/ai-routing')
    },
    buildModelsPayload () {
      return this.models
        .filter(m => m.ai_provider_id && m.ai_model_id)
        .map(m => ({
          ai_provider_id: m.ai_provider_id,
          ai_model_id: m.ai_model_id,
          priority: m.priority || 0,
          model_pattern: m.model_pattern || undefined,
          llm_id: m.llm_id || undefined,
        }))
    },
    async handleSubmit () {
      await validateModelForm(this.$refs.form)
      const models = this.buildModelsPayload()
      if (!models.length) {
        this.$message.warning(this.$t('aice.aiproxy.models_required'))
        return
      }
      this.loading = true
      try {
        await new this.$Manager('ai_routings').create({
          data: {
            generate_name: this.form.generate_name,
            model_pattern: this.form.model_pattern,
            priority: this.form.priority,
            ai_proxy_node_id: this.form.ai_proxy_node_id || undefined,
            llm_deployment_id: this.form.llm_deployment_id || undefined,
            models,
          },
        })
        this.handleCancel()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

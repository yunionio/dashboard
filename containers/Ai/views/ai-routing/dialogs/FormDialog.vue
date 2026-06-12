<template>
  <base-dialog :width="800" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.model_pattern')" prop="model_pattern">
          <a-input v-model="form.model_pattern" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.priority')" prop="priority">
          <a-input-number v-model="form.priority" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.ai_proxy_node_id')">
          <base-select v-model="form.ai_proxy_node_id" resource="ai_proxy_nodes" :params="{ scope: $store.getters.scope }" filterable version="v2" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.llm_deployment_id')">
          <a-input v-model="form.llm_deployment_id" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'

export default {
  name: 'AiRoutingFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? (this.params.data[0] || {}) : {}
    return {
      loading: false,
      form: {
        generate_name: '',
        model_pattern: data.model_pattern || '',
        priority: data.priority || 0,
        ai_proxy_node_id: data.ai_proxy_node_id || '',
        llm_deployment_id: data.llm_deployment_id || '',
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
        model_pattern: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.model_pattern')]) }],
      },
    }
  },
  methods: {
    async handleConfirm () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const data = {
          model_pattern: this.form.model_pattern,
          priority: this.form.priority,
          ai_proxy_node_id: this.form.ai_proxy_node_id || undefined,
          llm_deployment_id: this.form.llm_deployment_id || undefined,
        }
        if (this.params.type === 'edit') {
          await this.params.onManager('update', { id: this.params.data[0].id, managerArgs: { data } })
        } else {
          data.generate_name = this.form.generate_name
          await this.params.onManager('create', { managerArgs: { data } })
        }
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

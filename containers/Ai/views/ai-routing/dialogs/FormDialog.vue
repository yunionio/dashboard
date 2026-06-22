<template>
  <base-dialog :width="800" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item v-if="params.type !== 'edit'" :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.model_key')" prop="model_key">
          <a-input v-model="form.model_key" :placeholder="$t('aice.aiproxy.routing_model_key_tip')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.priority')" prop="priority">
          <a-input-number v-model="form.priority" :min="0" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.ai_proxy_node_id')">
          <base-select v-model="form.ai_proxy_node_id" resource="ai_proxy_nodes" :params="{ scope: $store.getters.scope }" filterable version="v2" />
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
        model_key: data.model_key || '',
        priority: data.priority || 0,
        ai_proxy_node_id: data.ai_proxy_node_id || '',
      },
      rules: {
        generate_name: this.params.type === 'edit' ? [] : [{ required: true, validator: this.$validate('resourceName') }],
        model_key: [{ required: true, validator: this.validateModelKey }],
      },
    }
  },
  methods: {
    validateModelKey (rule, value, callback) {
      if (String(value || '').trim()) {
        callback()
        return
      }
      callback(new Error(this.$t('aice.aiproxy.routing_model_key_required')))
    },
    async handleConfirm () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        const data = {
          model_key: this.form.model_key || undefined,
          priority: this.form.priority,
          ai_proxy_node_id: this.form.ai_proxy_node_id || undefined,
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

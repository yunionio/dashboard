<template>
  <base-dialog :width="720" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.import') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item label="repo_id">
          <a-input :value="fixed.repo_id" disabled />
        </a-form-model-item>
        <a-form-model-item :label="$t('common.name')" prop="generate_name">
          <a-input v-model="form.generate_name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_type')" prop="llm_type">
          <base-select
            v-model="form.llm_type"
            :options="llmTypeOptions"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.llm_type')]) }" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.model_name')" prop="model_name">
          <a-input v-model="form.model_name" :placeholder="$t('common.tips.input', [$t('aice.model_name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.model_tag')" prop="model_tag">
          <a-input v-model="form.model_tag" :placeholder="$t('common.tips.input', [$t('aice.model_tag')])" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import { LLM_TYPE_FORM_CONFIG } from '../../llm-sku/llmTypeConfig'

function toSafeName (fullName) {
  return String(fullName || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

export default {
  name: 'HuggingFaceImportDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const repoId = this.params?.repo_id
    const revision = this.params?.revision || 'main'
    const llmTypeOptions = Object.keys(LLM_TYPE_FORM_CONFIG || {}).map(id => ({ id, name: id }))
    return {
      loading: false,
      fixed: {
        source: 'huggingface',
        repo_id: repoId,
        revision,
      },
      form: {
        llm_type: this.params?.llm_type ?? (llmTypeOptions[0] && llmTypeOptions[0].id) ?? 'ollama',
        generate_name: this.params?.generate_name ?? toSafeName(repoId),
        model_name: this.params?.model_name ?? repoId,
        model_tag: '',
      },
      rules: {
        llm_type: [{ required: true, message: this.$t('common.tips.select', ['llm_type']) }],
        generate_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) }],
        model_name: [{ required: false, message: this.$t('common.tips.input', [this.$t('aice.model_name')]) }],
        model_tag: [{ required: false, message: this.$t('common.tips.input', [this.$t('aice.model_tag')]) }],
      },
      llmTypeOptions,
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        const data = {
          ...this.fixed,
          llm_type: this.form.llm_type,
          generate_name: this.form.generate_name,
          model_name: this.form.model_name,
          model_tag: this.form.model_tag,
        }
        await new this.$Manager('llm_instant_models').create({ data })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        if (typeof this.params?.onSuccess === 'function') this.params.onSuccess()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

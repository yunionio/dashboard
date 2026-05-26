<template>
  <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
    <a-form-model-item label="repo_id">
      <a-input :value="repoId" disabled />
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
</template>

<script>
import { validateModelForm } from '@/utils/validate'

const LLM_TYPE_OPTIONS = ['vllm', 'comfyui', 'sglang'].map(id => ({ id, name: id }))

function toSafeName (fullName) {
  return String(fullName || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
}

export default {
  name: 'HfInstantImportForm',
  props: {
    repoId: {
      type: String,
      required: true,
    },
    revision: {
      type: String,
      default: 'main',
    },
  },
  data () {
    return {
      form: {
        llm_type: LLM_TYPE_OPTIONS[0]?.id || 'vllm',
        generate_name: '',
        model_name: '',
        model_tag: '',
      },
      rules: {
        llm_type: [{ required: true, message: this.$t('common.tips.select', ['llm_type']) }],
        generate_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) }],
        model_name: [{ required: false, message: this.$t('common.tips.input', [this.$t('aice.model_name')]) }],
        model_tag: [{ required: false, message: this.$t('common.tips.input', [this.$t('aice.model_tag')]) }],
      },
      llmTypeOptions: LLM_TYPE_OPTIONS,
    }
  },
  watch: {
    repoId: {
      immediate: true,
      handler (id) {
        if (!id) return
        this.form.generate_name = toSafeName(id)
        this.form.model_name = id
        this.form.model_tag = ''
      },
    },
  },
  methods: {
    async validateAndGetData () {
      await validateModelForm(this.$refs.form)
      return {
        source: 'huggingface',
        repo_id: this.repoId,
        revision: this.revision,
        llm_type: this.form.llm_type,
        generate_name: this.form.generate_name,
        model_name: this.form.model_name,
        model_tag: this.form.model_tag,
      }
    },
  },
}
</script>

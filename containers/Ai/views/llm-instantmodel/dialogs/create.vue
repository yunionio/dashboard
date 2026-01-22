<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-model-item :label="$t('common.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
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

export default {
  name: 'LlmInstantmodelCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        name: undefined,
        llm_type: 'ollama',
        model_name: undefined,
        model_tag: undefined,
      },
      rules: {
        name: [{ required: true, validator: this.$validate('resourceName') }],
        llm_type: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) }],
        model_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.model_name')]) }],
        model_tag: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.model_tag')]) }],
      },
      llmTypeOptions: [
        { id: 'ollama', name: 'Ollama' },
      ],
    }
  },
  methods: {
    async handleConfirm () {
      try {
        await validateModelForm(this.$refs.form)
        const data = {
          generate_name: this.form.name,
          llm_type: this.form.llm_type,
          model_name: this.form.model_name,
          model_tag: this.form.model_tag,
        }
        await this.params.onManager('create', {
          managerArgs: { data },
        })
        this.loading = false
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

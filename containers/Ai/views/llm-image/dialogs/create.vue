<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
        <a-form-model-item :label="$t('common.name')" prop="name">
          <a-input v-model="form.name" :placeholder="$t('common.tips.input', [$t('common.name')])" :disabled="type === 'edit'" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_type')" prop="llm_type">
          <a-radio-group
            v-if="type !== 'edit'"
            v-model="form.llm_type"
            class="llm-type-picker"
            button-style="solid">
            <a-radio-button v-for="opt in llmTypeOptions" :key="opt.id" :value="opt.id">
              {{ opt.name }}
            </a-radio-button>
          </a-radio-group>
          <span v-else>{{ llmTypeName }}</span>
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_image.name')" prop="image_name">
          <a-input v-model="form.image_name" :placeholder="$t('common.tips.input', [$t('aice.llm_image.name')])" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.llm_image.label')" prop="image_label">
          <a-input v-model="form.image_label" :placeholder="$t('common.tips.input', [$t('aice.llm_image.label')])" />
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
import { LLM_TYPE_OPTIONS } from '../../llm-sku/llmTypeConfig'

export default {
  name: 'DesktopImageCreateDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? this.params.data[0] : {}
    const defaultLlmType = (LLM_TYPE_OPTIONS[0] && LLM_TYPE_OPTIONS[0].id) || 'openclaw'
    return {
      loading: false,
      type: this.params.type,
      form: {
        name: data.name || undefined,
        llm_type: data.llm_type || defaultLlmType,
        image_name: data.image_name || undefined,
        image_label: data.image_label || undefined,
      },
      rules: {
        name: [{ required: true, validator: this.$validate('imageName') }],
        llm_type: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) }],
        image_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_image.name')]) }],
        image_label: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_image.label')]) }],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    llmTypeOptions () {
      return LLM_TYPE_OPTIONS.map(opt => ({ id: opt.id, name: this.$t(opt.name) }))
    },
    llmTypeName () {
      const opt = LLM_TYPE_OPTIONS.find(o => o.id === this.form.llm_type)
      return opt ? this.$t(opt.name) : this.form.llm_type || '-'
    },
    desktopModelParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
      }
    },
  },
  methods: {
    async handleConfirm () {
      try {
        await validateModelForm(this.$refs.form)
        if (this.type === 'edit') {
          await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data: this.form,
            },
          })
        } else {
          await this.params.onManager('create', {
            managerArgs: {
              data: this.form,
            },
          })
        }
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

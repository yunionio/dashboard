<template>
  <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
    <a-form-model-item>
      <span slot="label">{{ $t('aice.llm_image.community_registry') }}</span>
      <a-input :value="fullName" disabled />
    </a-form-model-item>
    <a-form-model-item :label="$t('common.name')" prop="generate_name">
      <a-input v-model="form.generate_name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
    </a-form-model-item>
    <a-form-model-item :label="$t('aice.llm_type')" prop="llm_type">
      <a-input :value="form.llm_type" disabled />
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
import { toSafeName } from '@Ai/utils/communityRegistry'

export default {
  name: 'CommunityImportForm',
  props: {
    tag: {
      type: Object,
      default: null,
    },
  },
  data () {
    return {
      form: {
        llm_type: 'ollama',
        generate_name: '',
        model_name: '',
        model_tag: '',
      },
      rules: {
        generate_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) }],
        model_name: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.model_name')]) }],
        model_tag: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.model_tag')]) }],
      },
    }
  },
  computed: {
    fullName () {
      return this.tag?.full_name || ''
    },
  },
  watch: {
    tag: {
      immediate: true,
      handler (item) {
        if (!item) return
        this.form.llm_type = 'ollama'
        this.form.generate_name = toSafeName(item.full_name)
        this.form.model_name = item.model_name || ''
        this.form.model_tag = item.tag_name || ''
      },
    },
  },
  methods: {
    async validateAndGetData () {
      await validateModelForm(this.$refs.form)
      return {
        generate_name: this.form.generate_name,
        llm_type: this.form.llm_type,
        model_name: this.form.model_name,
        model_tag: this.form.model_tag,
      }
    },
  },
}
</script>

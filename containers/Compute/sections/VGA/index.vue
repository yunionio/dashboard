<template>
  <a-form-item>
    <a-radio-group v-decorator="decorator">
      <a-radio-button :value="opt.value" v-for="opt in vgaOptions" :key="opt.value">{{ opt.text }}</a-radio-button>
    </a-radio-group>
  </a-form-item>
</template>

<script>
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'VGA',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    formDraftKind: {
      type: String,
      default: 'selection',
    },
    decorator: {
      type: Array,
      required: true,
    },
    vdi: {
      type: String,
    },
    form: {
      type: Object,
    },
    showDefault: {
      type: Boolean,
    },
  },
  computed: {
    vgaOptions () {
      var options = []
      if (this.showDefault) {
        options.push({
          text: this.$t('compute.text_1'),
          value: '',
        })
      }
      if (this.vdi === 'vnc') {
        options.push({
          text: 'Standard',
          value: 'std',
        })
      }
      options.push(
        {
          text: 'QXL',
          value: 'qxl',
        },
      )
      return options
    },
    selectableVgaValues () {
      return this.vgaOptions.map(item => item.value)
    },
  },
  watch: {
    vdi: {
      handler () {
        const field = Array.isArray(this.decorator) ? this.decorator[0] : 'vga'
        const vga = this.form?.fc?.getFieldValue(field)
        if (!this.selectableVgaValues.includes(vga)) {
          const next = this.selectableVgaValues[0]
          if (next !== undefined && this.form?.fc) {
            this.form.fc.setFieldsValue({ [field]: next })
          }
        }
      },
    },
    selectableVgaValues: {
      immediate: true,
      handler () {
        this.$nextTick(() => this.restoreFormFieldDraftFields())
      },
    },
  },
  methods: {
    serializeFormFieldDraft () {
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'vga'
      const value = this.resolveFormFc()?.getFieldValue?.(field)
      if (value === undefined || value === null) return undefined
      return value
    },
    applyCreateFormFieldDraft (draft) {
      if (draft === undefined || draft === null) return
      if (!this.selectableVgaValues.includes(draft)) return
      const field = Array.isArray(this.decorator) ? this.decorator[0] : 'vga'
      const fc = this.resolveFormFc()
      if (!fc) return
      const current = fc.getFieldValue(field)
      if (current === draft || String(current) === String(draft)) return
      this.applyFormFieldValues({ [field]: draft })
    },
  },
}
</script>
